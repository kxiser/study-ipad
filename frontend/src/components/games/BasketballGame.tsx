import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Star,
  Flame,
  Check,
  Volume2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { completeStudySession } from '../../services/api.js';
import { getDynamicGameQuestions, GameQuestion } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';
import { getSelectedCharacter } from '../../utils/characters.js';

interface BasketballGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

export const BasketballGame: React.FC<BasketballGameProps> = ({
  exercises = [],
  title = 'Tiro a Canasta: Baloncesto Trivia',
  onBack,
  onStarsEarned
}) => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shotsMade, setShotsMade] = useState(0);
  const [ballState, setBallState] = useState<'idle' | 'shooting' | 'scored' | 'missed'>('idle');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const hero = getSelectedCharacter();

  // Cargar preguntas estrictamente basadas en los temas seleccionados
  useEffect(() => {
    const list = getDynamicGameQuestions(exercises, 7);
    setQuestions(list);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setShotsMade(0);
    setIsFinished(false);
    setShowCelebration(false);
  }, [exercises]);

  const currentQ = questions[currentIdx] || {
    id: 'placeholder',
    question: 'Cargando pregunta de baloncesto...',
    topic: 'Baloncesto',
    correctAnswer: 'Opción A',
    options: ['Opción A', 'Opción B', 'Opción C'],
    explanation: '¡Buena canasta!'
  };

  // Lanzar tiro a canasta
  const handleShoot = (option: string) => {
    if (ballState !== 'idle' || isFinished) return;

    setSelectedOption(option);
    setBallState('shooting');
    sounds.playPopSound();

    const isCorrect = option === currentQ.correctAnswer;

    setTimeout(() => {
      if (isCorrect) {
        sounds.playMatchSound();
        setBallState('scored');
        setShotsMade(s => s + 1);
        setStreak(st => st + 1);
        const pts = 3 + streak; // Triple con bonus de racha
        setScore(sc => sc + pts);
        setFeedback({
          isCorrect: true,
          text: `¡CANASTA LIMPIA! +${pts} PUNTOS 🏀 ${currentQ.explanation}`
        });
      } else {
        sounds.playWobbleSound();
        setBallState('missed');
        setStreak(0);
        setFeedback({
          isCorrect: false,
          text: `¡Rebote en el aro! La correcta era "${currentQ.correctAnswer}". ${currentQ.explanation}`
        });
      }

      // Pasar a la siguiente ronda
      setTimeout(() => {
        setBallState('idle');
        setSelectedOption(null);
        setFeedback(null);

        const next = currentIdx + 1;
        if (next >= questions.length) {
          setIsFinished(true);
          setShowCelebration(true);
          sounds.playVictorySound();
          const stars = Math.max(3, Math.round((shotsMade / questions.length) * 5));
          completeStudySession({
            sessionType: 'new',
            durationSeconds: 75,
            totalQuestions: questions.length,
            correctAnswers: shotsMade + (isCorrect ? 1 : 0),
            starsEarned: stars
          }).catch(() => {});
          if (onStarsEarned) onStarsEarned(stars);
        } else {
          setCurrentIdx(next);
        }
      }, 1800);
    }, 700);
  };

  const restartGame = () => {
    const list = getDynamicGameQuestions(exercises, 7);
    setQuestions(list);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setShotsMade(0);
    setBallState('idle');
    setFeedback(null);
    setIsFinished(false);
    setShowCelebration(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4 animate-fade-in select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra superior de marcador */}
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
          {/* Canastas anotadas */}
          <div className="flex items-center gap-1.5 bg-orange-500 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs md:text-sm shadow-md border-2 border-orange-400">
            <span>🏀 {shotsMade}/{questions.length || 7} Triples</span>
          </div>

          {/* Racha de canastas seguidas */}
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-400 text-amber-950 px-3 py-1.5 rounded-2xl font-black text-xs shadow-md border-2 border-amber-300 animate-bounce">
              <Flame className="w-4 h-4 fill-amber-950 text-amber-950" />
              <span>x{streak} Racha</span>
            </div>
          )}

          {/* Puntuación marcador */}
          <div className="flex items-center gap-1 bg-slate-900 text-amber-300 font-mono px-4 py-1.5 rounded-2xl font-black text-sm md:text-base border-2 border-slate-700 shadow-md">
            <span>PTS: {score}</span>
          </div>
        </div>
      </div>

      {/* CANCHA DE BALONCESTO Y TABLERO ELECTRÓNICO */}
      <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-amber-950/80 rounded-4xl p-6 md:p-8 text-white shadow-2xl border-4 border-orange-500/60 relative overflow-hidden flex flex-col items-center">
        {/* Marcador electrónico con la pregunta del tema de Samantha */}
        <div className="w-full max-w-2xl bg-black/80 rounded-3xl p-5 border-3 border-amber-400/80 shadow-2xl space-y-2 text-center relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-3 py-0.5 rounded-full border border-amber-400/40">
              {currentQ.topic} • Tiro {currentIdx + 1} de {questions.length}
            </span>

            <SpeechButton text={currentQ.question} size="sm" />
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-snug drop-shadow-md">
            {currentQ.question}
          </h3>
        </div>

        {/* CANASTA Y BALÓN ANIMADO EN VIVO */}
        <div className="relative w-full max-w-md h-52 sm:h-64 my-4 flex flex-col items-center justify-between">
          {/* Tablero y Red de la Canasta */}
          <div className="relative flex flex-col items-center">
            {/* Tablero de cristal / madera */}
            <div className="w-36 h-24 bg-white/95 rounded-2xl border-4 border-red-600 shadow-2xl flex items-center justify-center relative">
              {/* Cuadro interior de tiro */}
              <div className="w-16 h-12 border-2 border-red-600 rounded-lg"></div>

              {/* Aro naranja y Red */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 flex flex-col items-center">
                <div className="w-20 h-4 bg-orange-600 rounded-full border-2 border-orange-700 shadow-md"></div>
                {/* Malla de la red */}
                <div
                  className={`w-16 h-14 bg-gradient-to-b from-white/90 to-transparent border-x-2 border-dashed border-white/80 rounded-b-xl flex items-center justify-center transition-transform ${
                    ballState === 'scored' ? 'scale-y-125 animate-pulse' : ''
                  }`}
                >
                  <span className="text-white/40 text-[9px] font-mono">NET</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balón de Baloncesto con trayectoria animada */}
          <div className="relative h-16 flex items-center justify-center w-full">
            <div
              className={`w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 border-2 border-orange-950 shadow-2xl flex items-center justify-center text-2xl transition-all duration-700 ${
                ballState === 'shooting'
                  ? '-translate-y-28 scale-75 rotate-180 animate-spin'
                  : ballState === 'scored'
                  ? '-translate-y-20 scale-90'
                  : ballState === 'missed'
                  ? '-translate-y-16 translate-x-16 rotate-90 scale-75'
                  : 'animate-bounce'
              }`}
            >
              <span className="drop-shadow">🏀</span>
            </div>

            {/* Héroe tirador en la cancha */}
            <div className="absolute bottom-0 left-6 sm:left-12 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-2xl border border-white/20">
              <span className="text-3xl">{hero.emoji}</span>
              <span className="text-xs font-black text-amber-300">{hero.name}</span>
            </div>
          </div>
        </div>

        {/* FEEDBACK DEL TIRO */}
        {feedback && (
          <div
            className={`w-full max-w-xl p-3.5 rounded-2xl font-black text-xs sm:text-sm text-center shadow-xl animate-scale-up mb-3 ${
              feedback.isCorrect
                ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                : 'bg-rose-500 text-white border-2 border-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* BOTONES DE TIRO (OPCIONES DE RESPUESTA) */}
        {!isFinished && (
          <div className="w-full max-w-xl space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 text-center block">
              ¡Elige tu tiro a canasta! 👇
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentQ.options.map((opt, idx) => {
                const letters = ['A', 'B', 'C', 'D'];
                const isChosen = selectedOption === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleShoot(opt)}
                    disabled={ballState !== 'idle'}
                    className={`p-4 rounded-2xl border-3 font-black text-sm flex flex-col items-center justify-center text-center shadow-lg active:scale-95 transition-all disabled:opacity-50 ${
                      isChosen
                        ? 'bg-amber-400 text-amber-950 border-amber-300 scale-102 ring-4 ring-amber-300'
                        : 'bg-white hover:bg-amber-50 text-slate-800 border-white hover:border-amber-300'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center mb-1">
                      {letters[idx] || '🏀'}
                    </span>
                    <span className="line-clamp-2 leading-tight">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PANTALLA FINAL AL TERMINAR EL PARTIDO */}
        {isFinished && (
          <div className="w-full max-w-md bg-white rounded-4xl p-8 text-center text-slate-800 space-y-5 shadow-2xl border-4 border-orange-500 animate-scale-up my-2">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">
              ¡Victoria en la Cancha!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              ¡Has completado la sesión de tiros con {shotsMade} canastas triples y {score} puntos!
            </p>

            <div className="flex items-center justify-center gap-3 py-1">
              <div className="flex items-center gap-1.5 bg-orange-100 text-orange-950 border border-orange-300 px-4 py-2 rounded-2xl font-black text-sm">
                <span>🏀 {shotsMade} Canastas</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-950 border border-amber-300 px-4 py-2 rounded-2xl font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>+5 Estrellas</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={restartGame}
                className="flex-1 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-orange-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar otro partido</span>
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
