import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Star,
  Flame,
  Volume2,
  CheckCircle2,
  XCircle,
  Timer
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
  title = '🏀 Tiro a Canasta: Baloncesto Trivia',
  onBack,
  onStarsEarned
}) => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shotsMade, setShotsMade] = useState(0);
  const [ballAnimation, setBallAnimation] = useState<'idle' | 'shooting' | 'scored' | 'missed'>('idle');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shotClock, setShotClock] = useState(24);

  const hero = getSelectedCharacter();

  // Cargar preguntas basadas estrictamente en la selección
  const loadRoundQuestions = () => {
    const list = getDynamicGameQuestions(exercises, 7);
    setQuestions(list);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setShotsMade(0);
    setBallAnimation('idle');
    setSelectedOption(null);
    setFeedback(null);
    setIsFinished(false);
    setShowCelebration(false);
    setShotClock(24);
  };

  useEffect(() => {
    loadRoundQuestions();
  }, [exercises]);

  // Reloj de posesión de 24 segundos
  useEffect(() => {
    if (isFinished || ballAnimation !== 'idle') return;
    const interval = setInterval(() => {
      setShotClock(prev => (prev > 1 ? prev - 1 : 24));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, ballAnimation]);

  const currentQ = questions[currentIdx] || {
    id: 'placeholder',
    question: '¡Preparando el balón en la cancha!',
    topic: 'Baloncesto Escolar',
    correctAnswer: '',
    options: [],
    explanation: '¡A por el triple!'
  };

  const handleShoot = (option: string) => {
    if (ballAnimation !== 'idle' || isFinished) return;

    setSelectedOption(option);
    setBallAnimation('shooting');
    sounds.playPopSound();

    const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    // Tiempo de vuelo del balón hacia el aro
    setTimeout(() => {
      if (isCorrect) {
        sounds.playMatchSound();
        setBallAnimation('scored');
        setShotsMade(s => s + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        const pts = 3 + (newStreak > 1 ? newStreak * 2 : 0);
        setScore(sc => sc + pts);
        setFeedback({
          isCorrect: true,
          text: `¡CANASTA LIMPIA! +${pts} PUNTOS 🏀 ${currentQ.explanation}`
        });
      } else {
        sounds.playWobbleSound();
        setBallAnimation('missed');
        setStreak(0);
        setFeedback({
          isCorrect: false,
          text: `¡Rebote en el aro! La correcta era "${currentQ.correctAnswer}". ${currentQ.explanation}`
        });
      }

      // Avanzar a la siguiente pregunta o finalizar
      setTimeout(() => {
        if (currentIdx + 1 < questions.length) {
          setCurrentIdx(idx => idx + 1);
          setBallAnimation('idle');
          setSelectedOption(null);
          setFeedback(null);
          setShotClock(24);
        } else {
          setIsFinished(true);
          setShowCelebration(true);
          sounds.playVictorySound();
          const earned = Math.max(3, Math.floor((shotsMade + (isCorrect ? 1 : 0)) * 1.5));
          if (onStarsEarned) onStarsEarned(earned);
          completeStudySession({
            unitId: 'basketball-session',
            sessionType: 'review',
            durationSeconds: 90,
            totalQuestions: questions.length,
            correctAnswers: shotsMade + (isCorrect ? 1 : 0),
            starsEarned: earned
          }).catch(() => {});
        }
      }, 2600);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-amber-950 to-orange-950 text-white flex flex-col select-none overflow-x-hidden">
      {showCelebration && <ConfettiCelebration />}

      {/* HEADER / MARCADOR ELECTRÓNICO TIPO NBA */}
      <header className="p-4 bg-black/60 backdrop-blur border-b border-amber-500/30 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-xl border border-slate-600 transition-all shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Marcador Digital Central */}
        <div className="flex items-center gap-4 bg-slate-900/90 px-5 py-2 rounded-2xl border-2 border-amber-500 shadow-lg shadow-amber-500/20">
          <div className="text-center">
            <span className="text-[10px] tracking-widest text-amber-400 font-extrabold uppercase block">Puntos</span>
            <span className="text-2xl font-black text-amber-300 font-mono">{score}</span>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          {/* Reloj de Posesión 24s */}
          <div className="text-center">
            <span className="text-[10px] tracking-widest text-red-400 font-extrabold uppercase flex items-center justify-center gap-1">
              <Timer className="w-3 h-3" /> Posesión
            </span>
            <span className={`text-2xl font-black font-mono ${shotClock <= 5 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
              {shotClock.toString().padStart(2, '0')}s
            </span>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="text-center">
            <span className="text-[10px] tracking-widest text-emerald-400 font-extrabold uppercase block">Canastas</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {shotsMade}/{questions.length}
            </span>
          </div>

          {streak >= 2 && (
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-full font-black text-xs text-white animate-pulse shadow-md">
              <Flame className="w-4 h-4 fill-amber-300" />
              <span>x{streak} RACHA!</span>
            </div>
          )}
        </div>

        {/* Nivel / Tema actual */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-200 truncate max-w-[200px]">
            {currentQ.topic || 'Baloncesto'}
          </span>
        </div>
      </header>

      {/* CUERPO DEL JUEGO: CANCHA DE BALONCESTO ILUSTRADA + PREGUNTA */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between">
        {/* PISTA VECTORIAL DE MADERA Y TABLERO */}
        <div className="relative w-full h-56 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-700/60 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 flex flex-col justify-between p-4">
          {/* Textura de duelas de parqué barnizado */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 40px)'
            }}
          />

          {/* Líneas de la cancha (zona y línea de 3 puntos) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <circle cx="50%" cy="100%" r="40%" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.4" />
            <path d="M 30% 0 L 30% 100 M 70% 0 L 70% 100" stroke="#ffffff" strokeWidth="3" opacity="0.3" />
            <circle cx="50%" cy="20%" r="50" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.3" />
          </svg>

          {/* CANASTA: TABLERO DE CRISTAL + ARO DE HIERRO + RED */}
          <div className="relative z-10 w-full flex justify-center pt-1">
            <div className="relative flex flex-col items-center">
              {/* Tablero de metacrilato transparente con marco blanco y cuadro rojo */}
              <div className="w-44 sm:w-56 h-28 sm:h-36 rounded-lg border-4 border-white/80 bg-white/10 backdrop-blur-sm shadow-2xl flex items-center justify-center relative">
                {/* Cuadro objetivo rojo de tiro */}
                <div className="w-20 sm:w-24 h-14 sm:h-16 border-4 border-red-500 rounded-sm bg-red-500/10" />

                {/* Soporte metálico */}
                <div className="absolute -top-3 w-6 h-3 bg-slate-600 rounded-t" />
              </div>

              {/* Aro de metal naranja 3D */}
              <div className="relative -mt-3 z-20 flex flex-col items-center">
                <div
                  className={`w-20 sm:w-24 h-6 border-4 border-orange-500 rounded-full shadow-lg bg-orange-500/20 transition-transform ${
                    ballAnimation === 'scored' ? 'scale-110 border-amber-300' : ''
                  }`}
                />

                {/* Red de nylon con animación de movimiento al encestar */}
                <div
                  className={`w-16 sm:w-20 h-16 sm:h-20 transition-all duration-300 origin-top ${
                    ballAnimation === 'scored' ? 'scale-y-125 scale-x-90 text-amber-300' : 'text-white/80'
                  }`}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none stroke-[3]">
                    <path d="M 10 0 L 25 100 M 35 0 L 45 100 M 65 0 L 55 100 M 90 0 L 75 100" />
                    <path d="M 0 25 Q 50 40 100 25 M 5 55 Q 50 70 95 55 M 15 85 Q 50 95 85 85" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* BALÓN DE BALONCESTO ANIMADO */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Balón en posición de tiro o volando hacia la canasta */}
            <div
              className={`absolute transition-all duration-700 ease-out flex items-center justify-center ${
                ballAnimation === 'idle'
                  ? 'bottom-4 left-1/2 -translate-x-1/2 scale-100'
                  : ballAnimation === 'shooting'
                  ? 'bottom-[65%] left-1/2 -translate-x-1/2 scale-90 rotate-[360deg]'
                  : ballAnimation === 'scored'
                  ? 'bottom-[50%] left-1/2 -translate-x-1/2 scale-75 rotate-[720deg]'
                  : 'bottom-[45%] left-[65%] scale-75 rotate-180 translate-y-10'
              }`}
            >
              {/* Balón 3D con textura de cuero y líneas negras */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-amber-900 shadow-2xl border-2 border-orange-950 flex items-center justify-center overflow-hidden">
                {/* Costuras de baloncesto */}
                <div className="absolute inset-0 border-2 border-black/40 rounded-full" />
                <div className="absolute w-full h-[2px] bg-black/60" />
                <div className="absolute h-full w-[2px] bg-black/60" />
                <div className="absolute w-12 h-12 border-2 border-black/50 rounded-full" />
                {/* Brillo especular de luz */}
                <div className="absolute top-2 left-3 w-4 h-3 bg-white/40 rounded-full blur-[1px]" />
              </div>
            </div>
          </div>

          {/* MASCOTA HEROÍNA EN LA BANDA DE LA CANCHA */}
          <div className="absolute bottom-2 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
            <span className="text-3xl animate-bounce">{hero.emoji}</span>
            <div>
              <span className="text-xs font-black text-amber-300 block">{hero.name}</span>
              <span className="text-[10px] text-slate-300">¡Lanza un triple!</span>
            </div>
          </div>

          {/* EFECTO FLOTANTE DE PUNTUACIÓN */}
          {ballAnimation === 'scored' && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 animate-bounce">
              <span className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xl rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-900" />
                ¡TRIPLAZO! +{3 + (streak > 1 ? streak * 2 : 0)}
              </span>
            </div>
          )}
          {ballAnimation === 'missed' && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 animate-pulse">
              <span className="px-4 py-1.5 bg-red-600 text-white font-black text-sm rounded-xl shadow-lg border border-red-300">
                ¡Al hierro! Casi entra
              </span>
            </div>
          )}
        </div>

        {/* FEEDBACK PEDAGÓGICO INMEDIATO */}
        {feedback && (
          <div
            className={`mt-3 p-3.5 rounded-2xl text-center font-bold text-sm sm:text-base border-2 shadow-xl flex items-center justify-center gap-3 transition-all ${
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

        {/* TARJETA DE PREGUNTA TRIVIA */}
        {!isFinished ? (
          <div className="mt-4 bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 border-2 border-amber-500/40 shadow-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider">
                  Ronda {currentIdx + 1} de {questions.length}
                </span>
                <span className="text-xs text-amber-300/80 font-bold hidden sm:inline">
                  Elige la respuesta correcta para tirar a canasta
                </span>
              </div>
              <SpeechButton text={`${currentQ.question}`} size="sm" />
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight mb-5 text-center px-2">
              {currentQ.question}
            </h2>

            {/* BOTONES DE RESPUESTAS TÁCTILES TIPO NBA ARCADE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

                let btnStyle =
                  'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-amber-900/40 hover:to-orange-900/40 border-slate-700 text-white';

                if (selectedOption !== null) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40 scale-[1.02]'
                      : 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/40';
                  } else if (isCorrect) {
                    btnStyle = 'bg-emerald-800/60 border-emerald-500 text-emerald-200';
                  } else {
                    btnStyle = 'opacity-40 border-slate-800 text-slate-500';
                  }
                }

                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleShoot(option)}
                    disabled={ballAnimation !== 'idle'}
                    className={`group relative p-4 rounded-2xl border-2 font-bold text-base sm:text-lg text-left transition-all duration-150 active:scale-98 flex items-center gap-3.5 shadow-md ${btnStyle}`}
                  >
                    <span className="w-9 h-9 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center font-black text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                      {letter}
                    </span>
                    <span className="flex-1 leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* PANTALLA FINAL DE VICTORIA CON TROFEO Y ESTRELLAS */
          <div className="mt-4 bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 border-2 border-amber-500 text-center shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/30">
              <Trophy className="w-12 h-12 text-slate-950" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2">¡PARTIDAZO, CAMPEONA!</h2>
            <p className="text-amber-200 font-bold mb-6">
              Has encestado {shotsMade} de {questions.length} triples y sumado {score} puntos.
            </p>

            <div className="flex items-center gap-2 mb-8 bg-amber-500/20 px-6 py-3 rounded-2xl border border-amber-500/40">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-black text-amber-300">
                +{Math.max(3, Math.floor(shotsMade * 1.5))} Estrellas Ganadas
              </span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={loadRoundQuestions}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Jugar Otra Ronda</span>
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
