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
  Volume2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
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
  { name: 'Monstruo de las Sombras', emoji: '👾', maxHp: 100, color: 'from-purple-900 to-indigo-950' },
  { name: 'Robot del Desorden', emoji: '🤖', maxHp: 100, color: 'from-slate-800 to-cyan-950' },
  { name: 'Dragón Burlón', emoji: '🐲', maxHp: 100, color: 'from-rose-900 to-amber-950' }
];

export const HeroBattleGame: React.FC<HeroBattleGameProps> = ({
  exercises = [],
  title = 'Duelo de Héroes: Batalla de Poderes',
  onBack,
  onStarsEarned
}) => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [heroHp, setHeroHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [bossIndex, setBossIndex] = useState(0);
  const [attackState, setAttackState] = useState<'idle' | 'heroAttacking' | 'bossHit' | 'bossAttacking' | 'heroHit'>('idle');
  const [feedback, setFeedback] = useState<{ isHit: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const hero = getSelectedCharacter();
  const currentBoss = BOSSES[bossIndex % BOSSES.length];

  useEffect(() => {
    const list = getDynamicGameQuestions(exercises, 6);
    setQuestions(list);
    setCurrentIdx(0);
    setHeroHp(100);
    setBossHp(100);
    setIsFinished(false);
    setShowCelebration(false);
  }, [exercises]);

  const currentQ = questions[currentIdx] || {
    id: 'placeholder',
    question: 'Cargando duelo...',
    topic: 'Batalla',
    correctAnswer: 'Ataque Mágico',
    options: ['Ataque Mágico', 'Defensa', 'Salto'],
    explanation: '¡Gran impacto!'
  };

  const handleAttack = (option: string) => {
    if (attackState !== 'idle' || isFinished) return;

    setAttackState('heroAttacking');
    sounds.playPopSound();

    const isCorrect = option === currentQ.correctAnswer;

    setTimeout(() => {
      if (isCorrect) {
        sounds.playMatchSound();
        setAttackState('bossHit');
        const damage = 35;
        const newBossHp = Math.max(0, bossHp - damage);
        setBossHp(newBossHp);

        setFeedback({
          isHit: true,
          text: `¡GOLPE CRÍTICO! -${damage} HP 💥 ${currentQ.explanation}`
        });

        setTimeout(() => {
          setAttackState('idle');
          setFeedback(null);

          if (newBossHp <= 0) {
            setIsFinished(true);
            setShowCelebration(true);
            sounds.playVictorySound();
            const stars = 5;
            completeStudySession({
              sessionType: 'new',
              durationSeconds: 80,
              totalQuestions: questions.length,
              correctAnswers: currentIdx + 1,
              starsEarned: stars
            }).catch(() => {});
            if (onStarsEarned) onStarsEarned(stars);
          } else {
            setCurrentIdx(i => (i + 1) % questions.length);
          }
        }, 1600);
      } else {
        sounds.playWobbleSound();
        setAttackState('heroHit');
        setHeroHp(h => Math.max(20, h - 15)); // Nunca deja morir al niño, siempre le da oportunidad
        setFeedback({
          isHit: false,
          text: `¡El jefe bloqueó el ataque! La respuesta correcta era "${currentQ.correctAnswer}". ${currentQ.explanation}`
        });

        setTimeout(() => {
          setAttackState('idle');
          setFeedback(null);
          setCurrentIdx(i => (i + 1) % questions.length);
        }, 1800);
      }
    }, 600);
  };

  const restartBattle = () => {
    const list = getDynamicGameQuestions(exercises, 6);
    setQuestions(list);
    setCurrentIdx(0);
    setHeroHp(100);
    setBossHp(100);
    setBossIndex(b => (b + 1) % BOSSES.length);
    setAttackState('idle');
    setFeedback(null);
    setIsFinished(false);
    setShowCelebration(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4 animate-fade-in select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra superior */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-xs md:text-sm active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Juegos</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-rose-600 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs md:text-sm shadow-md border-2 border-rose-400">
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Ronda {currentIdx + 1} de {questions.length}</span>
          </div>
        </div>
      </div>

      {/* ARENA DE COMBATE 2D */}
      <div className={`bg-gradient-to-b ${currentBoss.color} rounded-4xl p-6 md:p-8 text-white shadow-2xl border-4 border-amber-400/80 relative overflow-hidden flex flex-col items-center`}>
        {/* Marcador central con la pregunta de Samantha */}
        <div className="w-full max-w-2xl bg-black/85 rounded-3xl p-5 border-3 border-amber-400 shadow-2xl space-y-2 text-center relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-3 py-0.5 rounded-full border border-amber-400/40">
              {currentQ.topic}
            </span>

            <SpeechButton text={currentQ.question} size="sm" />
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-snug drop-shadow-md">
            {currentQ.question}
          </h3>
        </div>

        {/* COMBATIENTES EN EL ESCENARIO (HÉROE VS JEFE) */}
        <div className="w-full max-w-2xl my-6 flex items-center justify-between px-4 sm:px-12 relative">
          {/* Lado izquierdo: Héroe de Samantha */}
          <div className="flex flex-col items-center space-y-2">
            {/* Barra de vida Héroe */}
            <div className="w-32 sm:w-44 bg-slate-800 rounded-full h-4 sm:h-5 p-0.5 border-2 border-white/60 shadow-lg overflow-hidden">
              <div
                style={{ width: `${heroHp}%` }}
                className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500"
              />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
              {hero.name} ({heroHp} HP)
            </span>

            {/* Avatar del Héroe animado */}
            <div
              className={`text-6xl sm:text-7xl transition-all duration-300 ${
                attackState === 'heroAttacking'
                  ? 'translate-x-24 scale-125 rotate-12'
                  : attackState === 'heroHit'
                  ? '-translate-x-4 opacity-75 rotate-[-20deg]'
                  : 'animate-bounce'
              }`}
            >
              {hero.emoji}
            </div>
          </div>

          {/* Icono central de VS */}
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 bg-black/50 px-3 py-1 rounded-2xl border-2 border-amber-400/60 shadow-lg">
              VS
            </span>
          </div>

          {/* Lado derecho: Jefe / Villano */}
          <div className="flex flex-col items-center space-y-2">
            {/* Barra de vida Villano */}
            <div className="w-32 sm:w-44 bg-slate-800 rounded-full h-4 sm:h-5 p-0.5 border-2 border-white/60 shadow-lg overflow-hidden">
              <div
                style={{ width: `${bossHp}%` }}
                className="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-500"
              />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
              {currentBoss.name} ({bossHp} HP)
            </span>

            {/* Avatar del Villano */}
            <div
              className={`text-6xl sm:text-7xl transition-all duration-300 ${
                attackState === 'bossHit'
                  ? 'translate-x-6 scale-90 opacity-60 rotate-45'
                  : 'animate-pulse'
              }`}
            >
              {currentBoss.emoji}
            </div>
          </div>
        </div>

        {/* FEEDBACK DEL ATAQUE */}
        {feedback && (
          <div
            className={`w-full max-w-xl p-3.5 rounded-2xl font-black text-xs sm:text-sm text-center shadow-xl animate-scale-up mb-3 ${
              feedback.isHit
                ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                : 'bg-rose-500 text-white border-2 border-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* BOTONES DE ATAQUE (OPCIONES DE RESPUESTA) */}
        {!isFinished && (
          <div className="w-full max-w-xl space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 text-center block">
              ¡Lanza tu ataque con la respuesta correcta! 💥
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentQ.options.map((opt, idx) => {
                const attackIcons = ['⚡', '🔥', '✨', '🌪️'];

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAttack(opt)}
                    disabled={attackState !== 'idle'}
                    className="p-4 rounded-2xl border-3 bg-white hover:bg-amber-50 text-slate-800 border-white hover:border-amber-400 font-black text-sm flex flex-col items-center justify-center text-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    <span className="text-xl mb-1">{attackIcons[idx] || '⚔️'}</span>
                    <span className="line-clamp-2 leading-tight">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PANTALLA FINAL AL VENCER AL JEFE */}
        {isFinished && (
          <div className="w-full max-w-md bg-white rounded-4xl p-8 text-center text-slate-800 space-y-5 shadow-2xl border-4 border-amber-400 animate-scale-up my-2">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">
              ¡K.O.! ¡Victoria de {hero.name}!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              ¡Has derrotado a {currentBoss.name} usando la sabiduría y los conocimientos de tu colegio!
            </p>

            <div className="flex items-center justify-center gap-3 py-1">
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-950 border border-amber-300 px-4 py-2 rounded-2xl font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>+5 Estrellas Mágicas</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={restartBattle}
                className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Otro combate</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm active:scale-95 transition-all"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
