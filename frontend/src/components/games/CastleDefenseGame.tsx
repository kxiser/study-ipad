import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Sparkles, Star, Trophy, RotateCcw, Hammer, Castle, Heart } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { Mascot } from '../Mascot.js';
import { completeStudySession } from '../../services/api.js';
import { VERIFIED_FACTS } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';

interface CastleDefenseProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

interface WallSection {
  id: number;
  isRepaired: boolean;
  question: string;
  topic: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

export const CastleDefenseGame: React.FC<CastleDefenseProps> = ({
  exercises = [],
  title = 'Salva la Torre de Chispa',
  onBack,
  onStarsEarned
}) => {
  const [sections, setSections] = useState<WallSection[]>([]);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [wallHealth, setWallHealth] = useState(30); // 0 a 100%
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Inicializar las 4 secciones del muro basadas en hechos verificados
  const initGame = () => {
    const selectedFacts = [...VERIFIED_FACTS].sort(() => Math.random() - 0.5).slice(0, 4);

    const initialSections: WallSection[] = selectedFacts.map((fact, idx) => {
      const opts = [fact.correctAnswer, ...fact.distractors.slice(0, 2)].sort(() => Math.random() - 0.5);
      return {
        id: idx + 1,
        isRepaired: false,
        question: fact.directQuestion,
        topic: fact.topic,
        correctAnswer: fact.correctAnswer,
        options: opts,
        explanation: fact.explanation
      };
    });

    setSections(initialSections);
    setActiveSectionIdx(0);
    setWallHealth(25);
    setFeedback(null);
    setIsGameOver(false);
    setHasWon(false);
    setShowCelebration(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const activeSection = sections[activeSectionIdx];

  const handleChooseBrick = (option: string) => {
    if (!activeSection || activeSection.isRepaired) return;

    if (option === activeSection.correctAnswer) {
      // ¡Ladrillo correcto! Repara el muro
      sounds.playMatchSound();
      const newHealth = Math.min(100, wallHealth + 25);
      setWallHealth(newHealth);
      setFeedback(`¡Piedra mágica colocada! ✨ ${activeSection.explanation}`);

      const updated = [...sections];
      updated[activeSectionIdx].isRepaired = true;
      setSections(updated);

      setTimeout(() => {
        if (activeSectionIdx + 1 >= sections.length) {
          // ¡Muro completamente restaurado!
          sounds.playVictorySound();
          setShowCelebration(true);
          setHasWon(true);
          const stars = 5;
          completeStudySession({
            sessionType: 'review',
            durationSeconds: 45,
            totalQuestions: 4,
            correctAnswers: 4,
            starsEarned: stars
          }).catch(() => {});
          if (onStarsEarned) onStarsEarned(stars);
        } else {
          setActiveSectionIdx(i => i + 1);
          setFeedback(null);
        }
      }, 1200);
    } else {
      // Ladrillo incorrecto
      sounds.playWobbleSound();
      setFeedback(`¡Casi! Ese bloque no encaja aquí. Vuelve a probar para reforzar la muralla.`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 animate-fade-in space-y-4 select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra Superior */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Resistencia de la Muralla */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-2xl">
          <Shield className="w-4 h-4 text-magic-600" />
          <div className="w-24 sm:w-32 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              style={{ width: `${wallHealth}%` }}
              className="bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 h-full transition-all duration-500 rounded-full"
            />
          </div>
          <span className="text-xs font-black text-slate-700">{wallHealth}%</span>
        </div>

        <button
          onClick={initGame}
          title="Reiniciar partida"
          className="p-2.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ILUSTRACIÓN DE LA MURALLA Y TORRE DE CHISPA */}
      <div className="relative bg-gradient-to-b from-sky-400 via-indigo-200 to-slate-200 rounded-4xl p-5 shadow-2xl border-4 border-slate-300 overflow-hidden text-center min-h-[260px] flex flex-col justify-between">
        {/* Nubes flotantes y Castillo */}
        <div className="flex items-center justify-between px-4 pt-1">
          <div className="text-4xl animate-pulse">☁️</div>
          {/* Chispa sobre las almenas */}
          <div className="flex flex-col items-center">
            <Mascot size="sm" mood={hasWon ? 'happy' : 'curious'} message={hasWon ? '¡Torre a salvo!' : '¡Ayúdame a reparar el muro!'} />
          </div>
          <div className="text-4xl animate-pulse">☁️</div>
        </div>

        {/* Representación visual de los 4 Bloques de la Muralla */}
        <div className="grid grid-cols-4 gap-2 pt-4 px-2">
          {sections.map((sec, idx) => {
            const isCurrent = idx === activeSectionIdx && !hasWon;
            return (
              <div
                key={sec.id}
                className={`relative rounded-2xl p-3 border-3 transition-all duration-300 flex flex-col items-center justify-center min-h-[90px] shadow-md ${
                  sec.isRepaired
                    ? 'bg-gradient-to-b from-emerald-100 to-emerald-200 border-emerald-400 text-emerald-900'
                    : isCurrent
                    ? 'bg-gradient-to-b from-amber-100 to-orange-100 border-amber-400 text-amber-950 animate-pulse ring-4 ring-amber-300'
                    : 'bg-slate-300 border-slate-400 text-slate-500 opacity-60'
                }`}
              >
                {sec.isRepaired ? (
                  <>
                    <span className="text-2xl">🧱</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mt-1">¡Reparado!</span>
                  </>
                ) : isCurrent ? (
                  <>
                    <Hammer className="w-6 h-6 text-amber-600 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 mt-1">¡Grieta {sec.id}!</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl opacity-40">💥</span>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">Bloque {sec.id}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TARJETA DE REPARACIÓN DIDÁCTICA */}
      {activeSection && !hasWon && (
        <div className="bg-white rounded-3xl p-5 border-3 border-magic-200 shadow-xl space-y-4 text-left animate-scale-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                Bloque {activeSection.id} de 4 • {activeSection.topic}
              </span>
            </div>
            <SpeechButton text={activeSection.question} size="sm" />
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
            {activeSection.question}
          </h3>

          {/* Opciones en forma de Bloques de Piedra Mágica */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              Elige el bloque de piedra correcto para sellar la grieta:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeSection.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChooseBrick(opt)}
                  className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 hover:from-amber-50 hover:to-orange-50 border-2 border-slate-300 hover:border-amber-400 font-bold text-slate-800 text-xs sm:text-sm text-center shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="text-sm">🧱</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className="bg-magic-50 text-magic-900 border border-magic-200 p-3 rounded-2xl text-xs font-bold animate-fade-in">
              {feedback}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE VICTORIA: TORRE A SALVO */}
      {hasWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-4xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-4 border-emerald-400">
            <Castle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-slate-800">¡Muralla Salvada!</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Has colocado todos los bloques con las respuestas exactas. ¡La torre del reino está protegida y has ganado 5 Estrellas Mágicas!
            </p>

            <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-xl py-1">
              <Star className="w-6 h-6 fill-amber-400" />
              <span>+5 Estrellas Mágicas</span>
            </div>

            <button
              onClick={initGame}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm active:scale-95 transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar otra defensa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
