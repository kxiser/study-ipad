import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Star,
  Flame,
  Zap,
  Shield,
  Heart,
  Swords,
  CheckCircle2,
  XCircle,
  PenLine,
  LayoutGrid
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { WrittenAnswerInput } from '../WrittenAnswerInput.js';
import { validateWrittenAnswer, ValidationResult } from '../../utils/answerValidator.js';
import { completeStudySession } from '../../services/api.js';
import { getDynamicGameQuestions, GameQuestion } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';
import { getSelectedCharacter } from '../../utils/characters.js';

interface HeroBattleGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

const BOSSES = [
  {
    name: 'Gólem del Olvido',
    avatar: '🗿',
    title: 'Guardián de Piedra',
    hp: 100,
    bgGradient: 'from-amber-950 via-purple-950 to-slate-950',
    weakness: 'Respuestas veloces'
  },
  {
    name: 'Dragón de Sombras',
    avatar: '🐲',
    title: 'Señor del Misterio',
    hp: 100,
    bgGradient: 'from-rose-950 via-purple-950 to-slate-950',
    weakness: 'Conocimiento brillante'
  },
  {
    name: 'Robot del Caos',
    avatar: '🤖',
    title: 'Máquina Descalibrada',
    hp: 100,
    bgGradient: 'from-cyan-950 via-indigo-950 to-slate-950',
    weakness: 'Lógica infalible'
  }
];

const SPELL_EFFECTS = [
  { name: '🔥 Llamarada Solar', color: 'from-amber-500 to-red-600', border: 'border-amber-400', textColor: 'text-amber-300' },
  { name: '⚡ Rayo Cósmico', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-300', textColor: 'text-yellow-300' },
  { name: '❄️ Ventisca Helada', color: 'from-cyan-400 to-blue-600', border: 'border-cyan-300', textColor: 'text-cyan-300' },
  { name: '🌿 Poder Natural', color: 'from-emerald-400 to-green-600', border: 'border-emerald-300', textColor: 'text-emerald-300' }
];

export const HeroBattleGame: React.FC<HeroBattleGameProps> = ({
  exercises = [],
  title = '🥊 Duelo de Héroes: Batalla de Poderes',
  onBack,
  onStarsEarned
}) => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [heroHp, setHeroHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [bossIdx, setBossIdx] = useState(0);
  const [battlePhase, setBattlePhase] = useState<'idle' | 'heroAttacking' | 'bossHit' | 'bossAttacking' | 'heroHit'>('idle');
  const [damagePopup, setDamagePopup] = useState<{ amount: number; isCrit: boolean; target: 'boss' | 'hero' } | null>(null);
  const [feedback, setFeedback] = useState<{ isHit: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [inputMode, setInputMode] = useState<'buttons' | 'written'>('buttons');

  const hero = getSelectedCharacter();
  const currentBoss = BOSSES[bossIdx % BOSSES.length];

  const loadBattle = () => {
    const list = getDynamicGameQuestions(exercises, 6);
    setQuestions(list);
    setCurrentIdx(0);
    setHeroHp(100);
    setBossHp(100);
    setBattlePhase('idle');
    setDamagePopup(null);
    setFeedback(null);
    setIsFinished(false);
    setShowCelebration(false);
  };

  useEffect(() => {
    loadBattle();
  }, [exercises]);

  const currentQ = questions[currentIdx] || {
    id: 'placeholder',
    question: '¡Preparando el combate mágico!',
    topic: 'Batalla Mágica',
    correctAnswer: '',
    options: [],
    explanation: '¡Lanza tu hechizo!'
  };

  const handleCastSpell = (option: string, spellIdx: number) => {
    if (battlePhase !== 'idle' || isFinished) return;

    setBattlePhase('heroAttacking');
    sounds.playPopSound();

    const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    // Vuelo del hechizo
    setTimeout(() => {
      if (isCorrect) {
        sounds.playMatchSound();
        setBattlePhase('bossHit');
        const dmg = Math.min(bossHp, Math.ceil(100 / Math.max(1, questions.length)));
        setBossHp(prev => Math.max(0, prev - dmg));
        setDamagePopup({ amount: dmg, isCrit: true, target: 'boss' });
        setFeedback({
          isHit: true,
          text: `¡GOLPE CRÍTICO! -${dmg} HP 💥 ${currentQ.explanation}`
        });
      } else {
        sounds.playWobbleSound();
        setBattlePhase('heroHit');
        const dmg = 15;
        setHeroHp(prev => Math.max(10, prev - dmg));
        setDamagePopup({ amount: dmg, isCrit: false, target: 'hero' });
        setFeedback({
          isHit: false,
          text: `¡El boss se defendió! La respuesta correcta era "${currentQ.correctAnswer}". ${currentQ.explanation}`
        });
      }

      setTimeout(() => {
        setDamagePopup(null);

        if (currentIdx + 1 < questions.length && bossHp > 20) {
          setCurrentIdx(idx => idx + 1);
          setBattlePhase('idle');
          setFeedback(null);
        } else {
          setIsFinished(true);
          setShowCelebration(true);
          sounds.playVictorySound();
          const stars = heroHp > 50 ? 5 : 3;
          if (onStarsEarned) onStarsEarned(stars);
          completeStudySession({
            unitId: 'battle-session',
            sessionType: 'review',
            durationSeconds: 90,
            totalQuestions: questions.length,
            correctAnswers: heroHp > 30 ? questions.length : Math.max(1, questions.length - 2),
            starsEarned: stars
          }).catch(() => {});
        }
      }, 2600);
    }, 800);
  };

  const handleWrittenCast = (result: ValidationResult) => {
    if (battlePhase !== 'idle' || isFinished) return;
    if (result.isCorrect) {
      handleCastSpell(currentQ.correctAnswer, 0);
    } else {
      handleCastSpell(result.userClean || 'fallo', 0);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentBoss.bgGradient} text-white flex flex-col select-none overflow-x-hidden`}>
      {showCelebration && <ConfettiCelebration />}

      {/* HEADER / MARCADOR DE COMBATE RPG */}
      <header className="p-4 bg-black/60 backdrop-blur border-b border-purple-500/30 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-xl border border-slate-600 transition-all shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-2xl border-2 border-purple-500 shadow-lg shadow-purple-500/20">
          <Swords className="w-5 h-5 text-purple-400" />
          <span className="font-black text-sm sm:text-base text-purple-200">
            Duelo {currentIdx + 1}/{questions.length}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-xl">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-purple-200 truncate max-w-[200px]">
            {currentQ.topic || 'Duelo Escolar'}
          </span>
        </div>
      </header>

      {/* ARENA DE COMBATE VISUAL */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between">
        <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-600/50 bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 flex flex-col justify-between p-4 sm:p-6">
          {/* Círculo rúnico mágico en el suelo de la arena */}
          <div className="absolute inset-x-8 bottom-4 h-24 rounded-full border-4 border-dashed border-purple-400/30 bg-purple-500/5 transform rotate-x-60 pointer-events-none" />

          {/* BARRAS DE VIDA (HP) DE LOS CONTENDIENTES */}
          <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-8">
            {/* HÉROE (SAMANTHA) */}
            <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border-2 border-emerald-500/60 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-black text-sm text-emerald-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  {hero.name}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">{heroHp}/100 HP</span>
              </div>
              <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500 rounded-full"
                  style={{ width: `${heroHp}%` }}
                />
              </div>
            </div>

            {/* BOSS ENEMIGO */}
            <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border-2 border-rose-500/60 shadow-lg text-right">
              <div className="flex items-center justify-between mb-1.5 flex-row-reverse">
                <span className="font-black text-sm text-rose-300 flex items-center gap-1.5 flex-row-reverse">
                  <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
                  {currentBoss.name}
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">{bossHp}/100 HP</span>
              </div>
              <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-500 rounded-full"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* COMBATIENTES EN EL ESCENARIO (HÉROE A LA IZQUIERDA, BOSS A LA DERECHA) */}
          <div className="relative z-10 flex items-center justify-between px-6 sm:px-12 my-auto">
            {/* Héroe de Samantha */}
            <div
              className={`relative flex flex-col items-center transition-all duration-300 ${
                battlePhase === 'heroAttacking'
                  ? 'translate-x-12 scale-110'
                  : battlePhase === 'heroHit'
                  ? '-translate-x-6 rotate-[-15deg] opacity-70'
                  : 'animate-bounce'
              }`}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-600/40 to-cyan-500/40 border-4 border-emerald-400 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shadow-emerald-500/30">
                {hero.emoji}
              </div>
              <span className="mt-2 text-xs font-black px-3 py-1 bg-emerald-500/80 rounded-full text-slate-950 uppercase tracking-wider">
                Heroína
              </span>

              {/* Popup de daño recibido por el héroe */}
              {damagePopup?.target === 'hero' && (
                <div className="absolute -top-8 animate-bounce">
                  <span className="px-3 py-1 bg-rose-600 font-black text-sm rounded-lg border border-white text-white shadow-xl">
                    -{damagePopup.amount} HP
                  </span>
                </div>
              )}
            </div>

            {/* Hechizo volando en mitad de la arena */}
            {battlePhase === 'heroAttacking' && (
              <div className="animate-ping">
                <span className="text-4xl">⚡✨🔥</span>
              </div>
            )}

            {/* Boss Enemigo */}
            <div
              className={`relative flex flex-col items-center transition-all duration-300 ${
                battlePhase === 'bossHit'
                  ? 'translate-x-8 rotate-12 opacity-60 scale-95'
                  : battlePhase === 'bossAttacking'
                  ? '-translate-x-12 scale-110'
                  : ''
              }`}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-purple-800/40 to-rose-600/40 border-4 border-rose-500 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shadow-rose-500/30">
                {currentBoss.avatar}
              </div>
              <span className="mt-2 text-xs font-black px-3 py-1 bg-rose-500/80 rounded-full text-white uppercase tracking-wider">
                {currentBoss.title}
              </span>

              {/* Popup de daño infligido al boss */}
              {damagePopup?.target === 'boss' && (
                <div className="absolute -top-8 animate-bounce">
                  <span className="px-3 py-1 bg-amber-400 font-black text-sm rounded-lg border-2 border-white text-slate-950 shadow-2xl">
                    -{damagePopup.amount} HP ¡CRÍTICO! 💥
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FEEDBACK PEDAGÓGICO */}
        {feedback && (
          <div
            className={`mt-3 p-3.5 rounded-2xl text-center font-bold text-sm sm:text-base border-2 shadow-xl flex items-center justify-center gap-3 transition-all ${
              feedback.isHit
                ? 'bg-purple-950/90 text-purple-200 border-purple-500 shadow-purple-500/20'
                : 'bg-rose-950/90 text-rose-200 border-rose-500 shadow-rose-500/20'
            }`}
          >
            {feedback.isHit ? (
              <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <p className="leading-snug">{feedback.text}</p>
          </div>
        )}

        {/* TARJETA DE PREGUNTA + HECHIZOS ELEMENTALES */}
        {!isFinished ? (
          <div className="mt-4 bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 border-2 border-purple-500/40 shadow-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500 text-white font-black text-xs rounded-full uppercase tracking-wider">
                  Turno de Ataque {currentIdx + 1}/{questions.length}
                </span>

                {/* Selector de Modo: Botones vs Escribir */}
                <div className="flex items-center bg-black/40 p-1 rounded-xl border border-purple-500/30">
                  <button
                    type="button"
                    onClick={() => setInputMode('buttons')}
                    className={`px-2.5 py-1 rounded-lg font-black text-[11px] flex items-center gap-1 transition-all ${
                      inputMode === 'buttons'
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'text-purple-200/70 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>Opciones</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('written')}
                    className={`px-2.5 py-1 rounded-lg font-black text-[11px] flex items-center gap-1 transition-all ${
                      inputMode === 'written'
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'text-purple-200/70 hover:text-white'
                    }`}
                  >
                    <PenLine className="w-3 h-3" />
                    <span>Escribir ✍️</span>
                  </button>
                </div>
              </div>
              <SpeechButton text={`${currentQ.question}`} size="sm" />
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight mb-5 text-center px-2">
              {currentQ.question}
            </h2>

            {/* MODO 1: BOTONES DE HECHIZOS MÁGICOS */}
            {inputMode === 'buttons' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((option, optIdx) => {
                  const spell = SPELL_EFFECTS[optIdx % SPELL_EFFECTS.length];

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleCastSpell(option, optIdx)}
                      disabled={battlePhase !== 'idle'}
                      className={`group relative p-4 rounded-2xl border-2 ${spell.border} bg-slate-900/90 hover:bg-gradient-to-r ${spell.color} font-bold text-base sm:text-lg text-left transition-all duration-150 active:scale-98 flex items-center justify-between gap-3 shadow-lg`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center font-black text-purple-300 shrink-0 group-hover:scale-110 transition-transform">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-white leading-snug">{option}</span>
                      </div>
                      <span className={`text-[11px] font-black ${spell.textColor} bg-black/40 px-2 py-1 rounded-lg border border-white/20 shrink-0 hidden sm:inline`}>
                        {spell.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* MODO 2: ENTRADA ESCRITA */
              <div className="bg-black/30 p-4 rounded-2xl border border-purple-500/20">
                <WrittenAnswerInput
                  correctAnswer={currentQ.correctAnswer}
                  options={currentQ.options}
                  placeholder="Escribe la palabra mágica para lanzar el hechizo ✨..."
                  disabled={battlePhase !== 'idle'}
                  onValidate={handleWrittenCast}
                  onSwitchToOptions={() => setInputMode('buttons')}
                />
              </div>
            )}
          </div>
        ) : (
          /* PANTALLA FINAL: VICTORIA ÉPICA */
          <div className="mt-4 bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 border-2 border-purple-500 text-center shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-amber-300 flex items-center justify-center mb-4 shadow-xl shadow-purple-500/30">
              <Trophy className="w-12 h-12 text-slate-950" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2">¡VICTORIA ÉPICA!</h2>
            <p className="text-purple-200 font-bold mb-6">
              Has derrotado a {currentBoss.name} y superado el desafío con honor.
            </p>

            <div className="flex items-center gap-2 mb-8 bg-purple-500/20 px-6 py-3 rounded-2xl border border-purple-500/40">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-black text-amber-300">
                +{heroHp > 50 ? 5 : 3} Estrellas Ganadas
              </span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  setBossIdx(i => i + 1);
                  loadBattle();
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Desafiar al Siguiente Boss</span>
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
