import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Star,
  Flame,
  Check,
  Shield,
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
  title = 'Tanda de Penaltis: ¡Golazo!',
  onBack,
  onStarsEarned
}) => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [goals, setGoals] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [shootState, setShootState] = useState<'idle' | 'shooting' | 'goal' | 'saved'>('idle');
  const [shotTarget, setShotTarget] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isGoal: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const hero = getSelectedCharacter();

  useEffect(() => {
    const list = getDynamicGameQuestions(exercises, 5);
    setQuestions(list);
    setCurrentIdx(0);
    setGoals(0);
    setSavedCount(0);
    setIsFinished(false);
    setShowCelebration(false);
  }, [exercises]);

  const currentQ = questions[currentIdx] || {
    id: 'placeholder',
    question: 'Cargando penalti...',
    topic: 'Fútbol',
    correctAnswer: 'Gol',
    options: ['Gol', 'Fuera', 'Poste'],
    explanation: '¡Golazo!'
  };

  const handleShootPenalty = (option: string, targetIdx: number) => {
    if (shootState !== 'idle' || isFinished) return;

    setShotTarget(targetIdx);
    setShootState('shooting');
    sounds.playPopSound();

    const isCorrect = option === currentQ.correctAnswer;

    setTimeout(() => {
      if (isCorrect) {
        sounds.playMatchSound();
        setShootState('goal');
        setGoals(g => g + 1);
        setFeedback({
          isGoal: true,
          text: `¡GOLAZOOOO POR LA ESCUADRA! ⚽ ${currentQ.explanation}`
        });
      } else {
        sounds.playWobbleSound();
        setShootState('saved');
        setSavedCount(s => s + 1);
        setFeedback({
          isGoal: false,
          text: `¡Parada del portero! La respuesta correcta era "${currentQ.correctAnswer}". ${currentQ.explanation}`
        });
      }

      setTimeout(() => {
        setShootState('idle');
        setFeedback(null);

        const next = currentIdx + 1;
        if (next >= questions.length) {
          setIsFinished(true);
          setShowCelebration(true);
          sounds.playVictorySound();
          const earned = Math.max(3, Math.round((goals / questions.length) * 5));
          completeStudySession({
            sessionType: 'new',
            durationSeconds: 60,
            totalQuestions: questions.length,
            correctAnswers: goals + (isCorrect ? 1 : 0),
            starsEarned: earned
          }).catch(() => {});
          if (onStarsEarned) onStarsEarned(earned);
        } else {
          setCurrentIdx(next);
        }
      }, 1900);
    }, 700);
  };

  const restartMatch = () => {
    const list = getDynamicGameQuestions(exercises, 5);
    setQuestions(list);
    setCurrentIdx(0);
    setGoals(0);
    setSavedCount(0);
    setShootState('idle');
    setFeedback(null);
    setIsFinished(false);
    setShowCelebration(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4 animate-fade-in select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Marcador superior del estadio */}
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
          {/* Goles a favor */}
          <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs md:text-sm shadow-md border-2 border-emerald-400">
            <span>⚽ {goals} Goles</span>
          </div>

          {/* Tiros restantes */}
          <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs md:text-sm shadow-md border-2 border-blue-400">
            <span>Penalti {currentIdx + 1} de {questions.length || 5}</span>
          </div>
        </div>
      </div>

      {/* ESTADIO DE FÚTBOL CON PORTERÍA Y CÉSPED */}
      <div className="bg-gradient-to-b from-sky-900 via-teal-950 to-emerald-950 rounded-4xl p-6 md:p-8 text-white shadow-2xl border-4 border-emerald-500 relative overflow-hidden flex flex-col items-center">
        {/* Marcador del estadio con la pregunta del temario de Samantha */}
        <div className="w-full max-w-2xl bg-black/85 rounded-3xl p-5 border-3 border-emerald-400 shadow-2xl space-y-2 text-center relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/20 px-3 py-0.5 rounded-full border border-emerald-400/40">
              {currentQ.topic}
            </span>

            <SpeechButton text={currentQ.question} size="sm" />
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-snug drop-shadow-md">
            {currentQ.question}
          </h3>
        </div>

        {/* LA PORTERÍA CON EL PORTERO Y LA TRAYECTORIA DEL BALÓN */}
        <div className="relative w-full max-w-lg h-56 sm:h-64 my-4 flex flex-col items-center justify-between">
          {/* Portería reglamentaria */}
          <div className="relative w-72 sm:w-96 h-36 sm:h-44 bg-white/10 backdrop-blur-sm rounded-t-2xl border-x-4 border-t-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Red de la portería */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>

            {/* Portero animado */}
            <div
              className={`text-5xl transition-transform duration-500 z-10 ${
                shootState === 'shooting'
                  ? 'translate-y-2'
                  : shootState === 'goal'
                  ? shotTarget === 0 ? 'translate-x-16 -rotate-45' : '-translate-x-16 rotate-45'
                  : shootState === 'saved'
                  ? shotTarget === 0 ? '-translate-x-20 -rotate-30' : 'translate-x-20 rotate-30'
                  : 'animate-pulse'
              }`}
            >
              🤖
            </div>

            {/* Marcadores de diana de disparo dentro de la portería */}
            <div className="absolute top-2 left-3 w-8 h-8 rounded-full border-2 border-dashed border-amber-300/80 flex items-center justify-center text-[10px] font-black text-amber-300">
              A
            </div>
            <div className="absolute top-2 right-3 w-8 h-8 rounded-full border-2 border-dashed border-amber-300/80 flex items-center justify-center text-[10px] font-black text-amber-300">
              B
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-dashed border-amber-300/80 flex items-center justify-center text-[10px] font-black text-amber-300">
              C
            </div>
          </div>

          {/* Punto de penalti y balón */}
          <div className="relative h-16 flex items-center justify-center w-full">
            <div
              className={`w-12 h-12 rounded-full bg-white border-2 border-slate-900 shadow-2xl flex items-center justify-center text-xl transition-all duration-700 ${
                shootState === 'shooting'
                  ? '-translate-y-28 scale-75 rotate-360'
                  : shootState === 'goal'
                  ? shotTarget === 0 ? '-translate-y-36 -translate-x-24 scale-65' : '-translate-y-36 translate-x-24 scale-65'
                  : shootState === 'saved'
                  ? '-translate-y-28 scale-75'
                  : 'animate-bounce'
              }`}
            >
              <span>⚽</span>
            </div>

            {/* Héroe lanzador en el campo */}
            <div className="absolute bottom-0 left-6 sm:left-12 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-2xl border border-white/20">
              <span className="text-3xl">{hero.emoji}</span>
              <span className="text-xs font-black text-emerald-300">{hero.name} al tiro</span>
            </div>
          </div>
        </div>

        {/* FEEDBACK DEL TIRO */}
        {feedback && (
          <div
            className={`w-full max-w-xl p-3.5 rounded-2xl font-black text-xs sm:text-sm text-center shadow-xl animate-scale-up mb-3 ${
              feedback.isGoal
                ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                : 'bg-rose-500 text-white border-2 border-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* BOTONES DE DISPARO (OPCIONES DE RESPUESTA) */}
        {!isFinished && (
          <div className="w-full max-w-xl space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 text-center block">
              ¡Apunta a la portería y chuta! 👇
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentQ.options.map((opt, idx) => {
                const letters = ['A (Escuadra Izq)', 'B (Escuadra Der)', 'C (Centro)', 'D (Raso)'];

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleShootPenalty(opt, idx)}
                    disabled={shootState !== 'idle'}
                    className="p-4 rounded-2xl border-3 bg-white hover:bg-emerald-50 text-slate-800 border-white hover:border-emerald-400 font-black text-sm flex flex-col items-center justify-center text-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                      {letters[idx] || '⚽'}
                    </span>
                    <span className="line-clamp-2 leading-tight">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PANTALLA FINAL AL TERMINAR LA TANDA */}
        {isFinished && (
          <div className="w-full max-w-md bg-white rounded-4xl p-8 text-center text-slate-800 space-y-5 shadow-2xl border-4 border-emerald-500 animate-scale-up my-2">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">
              ¡Campeones de la Tanda!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              ¡Has marcado {goals} golazos respondiendo con precisión a las preguntas del cole!
            </p>

            <div className="flex items-center justify-center gap-3 py-1">
              <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 px-4 py-2 rounded-2xl font-black text-sm">
                <span>⚽ {goals} Goles</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-950 border border-amber-300 px-4 py-2 rounded-2xl font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>+5 Estrellas</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={restartMatch}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-emerald-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Otra tanda</span>
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
