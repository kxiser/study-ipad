import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Star,
  Flame,
  CheckCircle2,
  XCircle,
  Volume2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { completeStudySession } from '../../services/api.js';
import { getDynamicGameQuestions, GameQuestion } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';
import { getSelectedCharacter } from '../../utils/characters.js';

interface SoccerPenaltyGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

export const SoccerPenaltyGame: React.FC<SoccerPenaltyGameProps> = ({
  exercises = [],
  title = '⚽ Penaltis de Primera: ¡Golazo!',
  onBack,
  onStarsEarned
}) => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [penaltyHistory, setPenaltyHistory] = useState<('goal' | 'miss')[]>([]);
  const [shootState, setShootState] = useState<'idle' | 'shooting' | 'goal' | 'saved'>('idle');
  const [shotZone, setShotZone] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-left');
  const [goalkeeperDive, setGoalkeeperDive] = useState<'left' | 'right' | 'center'>('center');
  const [feedback, setFeedback] = useState<{ isGoal: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const hero = getSelectedCharacter();

  const loadPenaltyShootout = () => {
    const list = getDynamicGameQuestions(exercises, 5);
    setQuestions(list);
    setCurrentIdx(0);
    setPenaltyHistory([]);
    setShootState('idle');
    setFeedback(null);
    setIsFinished(false);
    setShowCelebration(false);
  };

  useEffect(() => {
    loadPenaltyShootout();
  }, [exercises]);

  const currentQ = questions[currentIdx] || {
    id: 'placeholder',
    question: '¡Colocando el balón en el punto de penalti!',
    topic: 'Fútbol Escolar',
    correctAnswer: '',
    options: [],
    explanation: '¡Dispara con potencia!'
  };

  const zones: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[] = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right'
  ];

  const handleShoot = (option: string, zoneIdx: number) => {
    if (shootState !== 'idle' || isFinished) return;

    const chosenZone = zones[zoneIdx % zones.length];
    setShotZone(chosenZone);
    setShootState('shooting');
    sounds.playPopSound();

    const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    // El portero se lanza hacia el lado opuesto si aciertas, o hacia el mismo lado si fallas
    const dive = isCorrect
      ? chosenZone.includes('left') ? 'right' : 'left'
      : chosenZone.includes('left') ? 'left' : 'right';
    setGoalkeeperDive(dive);

    setTimeout(() => {
      if (isCorrect) {
        sounds.playMatchSound();
        setShootState('goal');
        setPenaltyHistory(prev => [...prev, 'goal']);
        setFeedback({
          isGoal: true,
          text: `¡¡¡GOOOOOOLAZO POR TODA LA ESCUADRA!!! ⚽ ${currentQ.explanation}`
        });
      } else {
        sounds.playWobbleSound();
        setShootState('saved');
        setPenaltyHistory(prev => [...prev, 'miss']);
        setFeedback({
          isGoal: false,
          text: `¡Parada del portero! La correcta era "${currentQ.correctAnswer}". ${currentQ.explanation}`
        });
      }

      setTimeout(() => {
        if (currentIdx + 1 < questions.length) {
          setCurrentIdx(idx => idx + 1);
          setShootState('idle');
          setFeedback(null);
          setGoalkeeperDive('center');
        } else {
          setIsFinished(true);
          setShowCelebration(true);
          sounds.playVictorySound();
          const goalsScored = penaltyHistory.filter(p => p === 'goal').length + (isCorrect ? 1 : 0);
          const earned = Math.max(3, goalsScored * 2);
          if (onStarsEarned) onStarsEarned(earned);
          completeStudySession({
            unitId: 'soccer-session',
            sessionType: 'review',
            durationSeconds: 75,
            totalQuestions: questions.length,
            correctAnswers: goalsScored,
            starsEarned: earned
          }).catch(() => {});
        }
      }, 2600);
    }, 850);
  };

  const goalsCount = penaltyHistory.filter(p => p === 'goal').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950 to-green-950 text-white flex flex-col select-none overflow-x-hidden">
      {showCelebration && <ConfettiCelebration />}

      {/* HEADER / MARCADOR DE PENALTIS DE LA COPA */}
      <header className="p-4 bg-black/60 backdrop-blur border-b border-emerald-500/30 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-xl border border-slate-600 transition-all shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Tanda de Penaltis Visual (Balones verdes y rojos) */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 px-4 py-2 rounded-2xl border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest hidden sm:inline">
            Tanda:
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: questions.length }).map((_, idx) => {
              const res = penaltyHistory[idx];
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all ${
                    res === 'goal'
                      ? 'bg-emerald-500 border-white text-slate-950 shadow-md shadow-emerald-500/50 scale-105'
                      : res === 'miss'
                      ? 'bg-rose-600 border-white text-white'
                      : idx === currentIdx
                      ? 'bg-slate-800 border-amber-400 text-amber-300 animate-pulse'
                      : 'bg-slate-800/60 border-slate-700 text-slate-500'
                  }`}
                >
                  {res === 'goal' ? '⚽' : res === 'miss' ? '❌' : idx + 1}
                </div>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-700 mx-1" />

          <span className="text-lg font-black text-emerald-300 font-mono">
            {goalsCount} Goles
          </span>
        </div>

        {/* Tema Escolar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-200 truncate max-w-[200px]">
            {currentQ.topic || 'Fútbol Trivia'}
          </span>
        </div>
      </header>

      {/* ESTADIO NOCTURNO VECTORIAL: CÉSPED, PORTERÍA 3D Y BALÓN */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between">
        <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-600/60 bg-gradient-to-b from-slate-900 via-emerald-950 to-green-900 flex flex-col justify-between p-4">
          {/* Focos de luz de estadio */}
          <div className="absolute top-0 left-8 w-32 h-44 bg-yellow-300/10 blur-2xl transform -rotate-45 pointer-events-none" />
          <div className="absolute top-0 right-8 w-32 h-44 bg-yellow-300/10 blur-2xl transform rotate-45 pointer-events-none" />

          {/* Gradas y siluetas de hinchas con bengalas en el fondo */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-around opacity-40">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping delay-200" />
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping delay-500" />
          </div>

          {/* CÉSPED A RAYAS DE PRIMERA DIVISIÓN */}
          <div
            className="absolute inset-x-0 bottom-0 h-44 opacity-80"
            style={{
              background: 'repeating-linear-gradient(0deg, #15803d 0px, #15803d 25px, #16a34a 25px, #16a34a 50px)'
            }}
          />

          {/* Líneas blancas del área grande y punto de penalti */}
          <svg className="absolute inset-x-0 bottom-0 w-full h-44 pointer-events-none" preserveAspectRatio="none">
            <path d="M 0 60 Q 50% 120 100% 60" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.6" />
            <circle cx="50%" cy="85%" r="6" fill="#ffffff" opacity="0.9" />
          </svg>

          {/* PORTERÍA 3D CON RED HEXAGONAL */}
          <div className="relative z-10 w-full flex justify-center pt-2">
            <div className="relative w-72 sm:w-96 h-36 sm:h-44 flex flex-col items-center">
              {/* Postes blancos de la portería */}
              <div
                className={`w-full h-full border-t-8 border-x-8 border-white rounded-t-lg relative shadow-2xl transition-transform ${
                  shootState === 'goal' ? 'scale-105' : ''
                }`}
              >
                {/* Red interior con cuadrícula */}
                <div
                  className={`absolute inset-0 bg-white/5 transition-all duration-300 ${
                    shootState === 'goal' ? 'bg-emerald-500/20 scale-102' : ''
                  }`}
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.2) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.2) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.2) 75%)',
                    backgroundSize: '16px 16px'
                  }}
                />

                {/* Portero Rival animado */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out flex flex-col items-center ${
                    goalkeeperDive === 'left'
                      ? '-translate-x-[110%] bottom-4 rotate-[-40deg]'
                      : goalkeeperDive === 'right'
                      ? 'translate-x-[20%] bottom-4 rotate-[40deg]'
                      : shootState === 'saved'
                      ? '-translate-x-1/2 bottom-8 scale-110'
                      : '-translate-x-1/2 bottom-1'
                  }`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Cabeza y gorra */}
                    <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-slate-800 shadow-md flex items-center justify-center text-xs">
                      🧢
                    </div>
                    {/* Jersey de portero con guantes gigantes */}
                    <div className="w-12 h-14 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-t-xl border-2 border-slate-900 flex items-center justify-between px-1">
                      <span className="text-base">🧤</span>
                      <span className="font-black text-[10px] text-slate-900">1</span>
                      <span className="text-base">🧤</span>
                    </div>
                    {/* Pantalón y medias */}
                    <div className="w-10 h-7 bg-slate-900 rounded-b flex justify-between px-1">
                      <div className="w-3 h-full bg-slate-800 rounded-b" />
                      <div className="w-3 h-full bg-slate-800 rounded-b" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BALÓN DE FÚTBOL ANIMADO */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div
              className={`absolute transition-all duration-700 ease-out flex items-center justify-center ${
                shootState === 'idle'
                  ? 'bottom-6 left-1/2 -translate-x-1/2 scale-100'
                  : shootState === 'shooting'
                  ? shotZone === 'top-left'
                    ? 'bottom-[55%] left-[34%] scale-65 rotate-[720deg]'
                    : shotZone === 'top-right'
                    ? 'bottom-[55%] left-[64%] scale-65 rotate-[720deg]'
                    : shotZone === 'bottom-left'
                    ? 'bottom-[35%] left-[34%] scale-65 rotate-[720deg]'
                    : 'bottom-[35%] left-[64%] scale-65 rotate-[720deg]'
                  : shootState === 'goal'
                  ? shotZone.includes('left')
                    ? 'bottom-[52%] left-[32%] scale-60 rotate-[1080deg]'
                    : 'bottom-[52%] left-[66%] scale-60 rotate-[1080deg]'
                  : 'bottom-[40%] left-1/2 -translate-x-1/2 scale-70 rotate-180 translate-y-6'
              }`}
            >
              {/* Balón clásico con hexágonos blancos y negros */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-2xl border-2 border-slate-800 flex items-center justify-center overflow-hidden">
                <div className="w-7 h-7 bg-slate-950 clip-polygon" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
                <div className="absolute top-1 left-2 w-4 h-3 bg-white/60 rounded-full blur-[1px]" />
              </div>
            </div>
          </div>

          {/* SAMANTHA AL BORDE DEL ÁREA CON EL DISPARO */}
          <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20">
            <span className="text-3xl animate-bounce">{hero.emoji}</span>
            <div>
              <span className="text-xs font-black text-emerald-300 block">{hero.name}</span>
              <span className="text-[10px] text-slate-300">¡Dispara a la escuadra!</span>
            </div>
          </div>

          {/* BANNER ANIMADO DE ¡¡¡GOOOOOOLAZO!!! */}
          {shootState === 'goal' && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 animate-bounce">
              <span className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 via-green-400 to-yellow-300 text-slate-950 font-black text-2xl rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-900" />
                ¡¡¡GOOOOOOLAZO!!!
              </span>
            </div>
          )}
          {shootState === 'saved' && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 animate-pulse">
              <span className="px-5 py-2 bg-rose-600 text-white font-black text-base rounded-2xl shadow-xl border border-rose-300">
                ¡Parada del portero!
              </span>
            </div>
          )}
        </div>

        {/* FEEDBACK PEDAGÓGICO */}
        {feedback && (
          <div
            className={`mt-3 p-3.5 rounded-2xl text-center font-bold text-sm sm:text-base border-2 shadow-xl flex items-center justify-center gap-3 transition-all ${
              feedback.isGoal
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500 shadow-emerald-500/20'
                : 'bg-rose-950/90 text-rose-200 border-rose-500 shadow-rose-500/20'
            }`}
          >
            {feedback.isGoal ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <p className="leading-snug">{feedback.text}</p>
          </div>
        )}

        {/* TARJETA DE PREGUNTA + SELECCIÓN DE TIRO A PUERTA */}
        {!isFinished ? (
          <div className="mt-4 bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 border-2 border-emerald-500/40 shadow-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider">
                  Penalti {currentIdx + 1} de {questions.length}
                </span>
                <span className="text-xs text-emerald-300/80 font-bold hidden sm:inline">
                  Acierta la pregunta para colocar el balón en la red
                </span>
              </div>
              <SpeechButton text={`${currentQ.question}`} size="sm" />
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight mb-5 text-center px-2">
              {currentQ.question}
            </h2>

            {/* BOTONES DE RESPUESTA: 4 ZONAS DE TIRO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((option, optIdx) => {
                const zoneNames = ['↖️ Escuadra Izquierda', '↗️ Escuadra Derecha', '↙️ Raso Izquierda', '↘️ Raso Derecha'];
                const zoneBadge = zoneNames[optIdx % zoneNames.length];

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleShoot(option, optIdx)}
                    disabled={shootState !== 'idle'}
                    className="group relative p-4 rounded-2xl border-2 border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-emerald-950/60 hover:to-green-950/60 font-bold text-base sm:text-lg text-left transition-all duration-150 active:scale-98 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center font-black text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-white leading-snug">{option}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400/80 bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-500/30 shrink-0 hidden sm:inline">
                      {zoneBadge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* PANTALLA FINAL: CAMPEONES DE LA COPA */
          <div className="mt-4 bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 border-2 border-emerald-500 text-center shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-300 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/30">
              <Trophy className="w-12 h-12 text-slate-950" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2">¡CAMPEONA DEL TORNEO!</h2>
            <p className="text-emerald-200 font-bold mb-6">
              Has marcado {goalsCount} de {questions.length} penaltis decisivos.
            </p>

            <div className="flex items-center gap-2 mb-8 bg-emerald-500/20 px-6 py-3 rounded-2xl border border-emerald-500/40">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-black text-amber-300">
                +{Math.max(3, goalsCount * 2)} Estrellas Ganadas
              </span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={loadPenaltyShootout}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Tirar Otra Tanda</span>
              </button>
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-600 transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al Menú</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
