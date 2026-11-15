import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Star,
  Flame,
  Timer,
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

interface QuizShowGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

const KAHOOT_COLORS = [
  {
    bg: 'bg-red-600 hover:bg-red-500 active:bg-red-700',
    border: 'border-red-400',
    shadow: 'shadow-red-600/30',
    shape: '▲',
    shapeName: 'Triángulo Rojo'
  },
  {
    bg: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
    border: 'border-blue-400',
    shadow: 'shadow-blue-600/30',
    shape: '◆',
    shapeName: 'Rombo Azul'
  },
  {
    bg: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
    border: 'border-amber-300',
    shadow: 'shadow-amber-500/30',
    shape: '●',
    shapeName: 'Círculo Amarillo'
  },
  {
    bg: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700',
    border: 'border-emerald-400',
    shadow: 'shadow-emerald-600/30',
    shape: '■',
    shapeName: 'Cuadrado Verde'
  }
];

export const QuizShowGame: React.FC<QuizShowGameProps> = ({
  exercises = [],
  title = '🎉 El Gran Concurso de Preguntas',
  onBack,
  onStarsEarned
}) => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20);

  const hero = getSelectedCharacter();

  const loadQuizShow = () => {
    const list = getDynamicGameQuestions(exercises, 8);
    setQuestions(list);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
    setSelectedOption(null);
    setFeedback(null);
    setIsFinished(false);
    setShowCelebration(false);
    setTimerSeconds(20);
  };

  useEffect(() => {
    loadQuizShow();
  }, [exercises]);

  // Temporizador de 20 segundos por pregunta
  useEffect(() => {
    if (isFinished || selectedOption !== null) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          handleSelectOption(''); // Tiempo agotado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, selectedOption, currentIdx]);

  const currentQ = questions[currentIdx] || {
    id: 'placeholder',
    question: '¡Sintonizando el Gran Concurso!',
    topic: 'Concurso Escolar',
    correctAnswer: '',
    options: [],
    explanation: '¡Acierta y suma puntos!'
  };

  const handleSelectOption = (option: string) => {
    if (selectedOption !== null || isFinished) return;

    setSelectedOption(option);
    const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      sounds.playMatchSound();
      setCorrectAnswers(c => c + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const speedBonus = timerSeconds * 10;
      const streakBonus = newStreak > 1 ? newStreak * 150 : 0;
      const ptsEarned = 1000 + speedBonus + streakBonus;
      setScore(s => s + ptsEarned);
      setFeedback({
        isCorrect: true,
        text: `¡CORRECTO! +${ptsEarned} PUNTOS 🌟 ${currentQ.explanation}`
      });
    } else {
      sounds.playWobbleSound();
      setStreak(0);
      setFeedback({
        isCorrect: false,
        text: `¡Oh no! La respuesta correcta era "${currentQ.correctAnswer}". ${currentQ.explanation}`
      });
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(idx => idx + 1);
        setSelectedOption(null);
        setFeedback(null);
        setTimerSeconds(20);
      } else {
        setIsFinished(true);
        setShowCelebration(true);
        sounds.playVictorySound();
        const finalCorrect = correctAnswers + (isCorrect ? 1 : 0);
        const earned = Math.max(3, Math.floor(finalCorrect * 1.5));
        if (onStarsEarned) onStarsEarned(earned);
        completeStudySession({
          unitId: 'quiz-show-session',
          sessionType: 'review',
          durationSeconds: 120,
          totalQuestions: questions.length,
          correctAnswers: finalCorrect,
          starsEarned: earned
        }).catch(() => {});
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col select-none overflow-x-hidden">
      {showCelebration && <ConfettiCelebration />}

      {/* HEADER / MARCADOR DE CONCURSO TELEVISIVO */}
      <header className="p-4 bg-black/60 backdrop-blur border-b border-indigo-500/30 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-xl border border-slate-600 transition-all shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Marcador de Puntos y Racha */}
        <div className="flex items-center gap-4 bg-slate-900/90 px-5 py-2 rounded-2xl border-2 border-indigo-500 shadow-lg shadow-indigo-500/20">
          <div className="text-center">
            <span className="text-[10px] tracking-widest text-indigo-400 font-extrabold uppercase block">Puntos</span>
            <span className="text-2xl font-black text-indigo-300 font-mono">{score.toLocaleString()}</span>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          {/* Temporizador */}
          <div className="text-center">
            <span className="text-[10px] tracking-widest text-amber-400 font-extrabold uppercase flex items-center justify-center gap-1">
              <Timer className="w-3 h-3" /> Tiempo
            </span>
            <span className={`text-2xl font-black font-mono ${timerSeconds <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
              {timerSeconds}s
            </span>
          </div>

          {streak >= 2 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-full font-black text-xs text-white animate-pulse shadow-md">
              <Flame className="w-4 h-4 fill-amber-300" />
              <span>x{streak} RACHA!</span>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-200 truncate max-w-[200px]">
            {currentQ.topic || 'Concurso'}
          </span>
        </div>
      </header>

      {/* CUERPO DEL CONCURSO ESTILO KAHOOT */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between">
        {/* BARRA DE PROGRESO DE TIEMPO PULSANTE */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner mb-3">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timerSeconds <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-indigo-500'
            }`}
            style={{ width: `${(timerSeconds / 20) * 100}%` }}
          />
        </div>

        {/* FEEDBACK PEDAGÓGICO */}
        {feedback && (
          <div
            className={`mb-3 p-3.5 rounded-2xl text-center font-bold text-sm sm:text-base border-2 shadow-xl flex items-center justify-center gap-3 transition-all ${
              feedback.isCorrect
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500 shadow-emerald-500/20'
                : 'bg-rose-950/90 text-rose-200 border-rose-500 shadow-rose-500/20'
            }`}
          >
            {feedback.isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <p className="leading-snug">{feedback.text}</p>
          </div>
        )}

        {!isFinished ? (
          <div className="flex-1 flex flex-col justify-between">
            {/* TARJETA DE LA PREGUNTA PRINCIPAL */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 border-2 border-indigo-500/40 shadow-2xl flex flex-col justify-center items-center text-center relative mb-4 min-h-[140px]">
              <div className="flex items-center justify-between w-full mb-3">
                <span className="px-3.5 py-1 bg-indigo-500 text-white font-black text-xs rounded-full uppercase tracking-wider">
                  Pregunta {currentIdx + 1} de {questions.length}
                </span>
                <SpeechButton text={`${currentQ.question}`} size="sm" />
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight px-2 max-w-2xl">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 BOTONES GIGANTES TIPO KAHOOT / BLOOKET */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
              {currentQ.options.map((option, optIdx) => {
                const colorConfig = KAHOOT_COLORS[optIdx % KAHOOT_COLORS.length];
                const isSelected = selectedOption === option;
                const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

                let cardStyle = `${colorConfig.bg} ${colorConfig.border} ${colorConfig.shadow}`;

                if (selectedOption !== null) {
                  if (isSelected) {
                    cardStyle = isCorrect
                      ? 'bg-emerald-600 border-white ring-4 ring-emerald-400 scale-[1.02]'
                      : 'bg-rose-600 border-white ring-4 ring-rose-400';
                  } else if (isCorrect) {
                    cardStyle = 'bg-emerald-600 border-emerald-300';
                  } else {
                    cardStyle = 'opacity-30 grayscale border-transparent';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(option)}
                    disabled={selectedOption !== null}
                    className={`group relative p-5 sm:p-6 rounded-3xl border-4 font-black text-lg sm:text-xl text-left text-white transition-all duration-150 active:scale-98 flex items-center gap-4 shadow-xl min-h-[90px] ${cardStyle}`}
                  >
                    {/* Forma geométrica blanca tipo Kahoot */}
                    <div className="w-12 h-12 rounded-2xl bg-black/25 flex items-center justify-center font-black text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {colorConfig.shape}
                    </div>

                    <span className="flex-1 leading-snug drop-shadow-sm">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* PODIO DE CONCURSO FINAL */
          <div className="mt-4 bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 border-2 border-indigo-500 text-center shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-300 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30">
              <Trophy className="w-12 h-12 text-slate-950" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2">¡PUNTUACIÓN HISTÓRICA!</h2>
            <p className="text-indigo-200 font-bold mb-6">
              Has acertado {correctAnswers} de {questions.length} preguntas y conseguido {score.toLocaleString()} puntos.
            </p>

            <div className="flex items-center gap-2 mb-8 bg-indigo-500/20 px-6 py-3 rounded-2xl border border-indigo-500/40">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-black text-amber-300">
                +{Math.max(3, Math.floor(correctAnswers * 1.5))} Estrellas Ganadas
              </span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={loadQuizShow}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Jugar Otro Concurso</span>
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
