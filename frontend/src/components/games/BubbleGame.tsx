import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Star, Trophy, RotateCcw } from 'lucide-react';
import { ExerciseItem } from '../../types.js';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { completeStudySession } from '../../services/api.js';

interface Bubble {
  id: string;
  text: string;
  isCorrect: boolean;
  x: number; // percentage 10-85
  y: number; // top percentage 20-80
  speed: number;
  color: string;
  isPopping?: boolean;
}

interface BubbleGameProps {
  exercises: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

export const BubbleGame: React.FC<BubbleGameProps> = ({
  exercises,
  title = 'Atrapa la Burbuja',
  onBack,
  onStarsEarned
}) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [questions, setQuestions] = useState<Array<{ question: string; correct: string; options: string[] }>>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Inicializar preguntas
  const initGame = () => {
    const qList: Array<{ question: string; correct: string; options: string[] }> = [];

    exercises.forEach(ex => {
      if (ex.type === 'multiple_choice' && ex.question && ex.options?.length) {
        qList.push({
          question: ex.question,
          correct: ex.correctAnswer,
          options: [...ex.options].sort(() => Math.random() - 0.5)
        });
      } else if (ex.type === 'fill_blank' && ex.textWithBlank && ex.options?.length) {
        qList.push({
          question: ex.textWithBlank.replace('___', '¿______?'),
          correct: ex.correctAnswer,
          options: [...ex.options].sort(() => Math.random() - 0.5)
        });
      } else if (ex.type === 'true_false' && ex.statement) {
        qList.push({
          question: `¿Verdadero o Falso? "${ex.statement}"`,
          correct: ex.isTrue ? 'Verdadero' : 'Falso',
          options: ['Verdadero', 'Falso']
        });
      }
    });

    if (qList.length < 3) {
      qList.push(
        { question: '¿Cuál es un animal vertebrado?', correct: 'El perro', options: ['El perro', 'La lombriz', 'La medusa'] },
        { question: '¿Cuánto es 5 × 4?', correct: '20', options: ['15', '20', '25', '18'] },
        { question: '¿En qué continente vivimos?', correct: 'Europa', options: ['Europa', 'Antártida', 'Oceanía'] },
        { question: '¿El agua de los ríos es dulce o salada?', correct: 'Agua dulce', options: ['Agua dulce', 'Agua salada'] }
      );
    }

    const shuffled = [...qList].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentRound(0);
    setScore(0);
    setCombo(0);
    setIsGameOver(false);
    setFeedback(null);
  };

  useEffect(() => {
    initGame();
  }, [exercises]);

  // Generar burbujas para la ronda actual
  useEffect(() => {
    if (questions.length === 0 || currentRound >= questions.length) return;

    const currentQ = questions[currentRound];
    const colors = [
      'from-pink-400 to-rose-500 border-pink-300 text-white',
      'from-sky-400 to-blue-500 border-sky-300 text-white',
      'from-emerald-400 to-teal-500 border-emerald-300 text-white',
      'from-amber-400 to-orange-500 border-amber-300 text-white'
    ];

    const norm = (s: string) => (s || '').trim().toLowerCase().replace(/[\.\,\!]$/, '');
    const cleanCorrect = norm(currentQ.correct);

    const newBubbles: Bubble[] = currentQ.options.slice(0, 4).map((opt, idx) => {
      // Dispersar horizontalmente
      const spread = 80 / Math.max(currentQ.options.length, 1);
      const baseX = 10 + idx * spread;
      const cleanOpt = norm(opt);
      return {
        id: `bubble-${currentRound}-${idx}`,
        text: opt,
        isCorrect: cleanOpt === cleanCorrect,
        x: Math.min(Math.max(baseX + (Math.random() * 8 - 4), 5), 75),
        y: 40 + (idx % 2 === 0 ? 0 : 25) + (Math.random() * 10 - 5),
        speed: 0.3 + Math.random() * 0.2,
        color: colors[idx % colors.length]
      };
    });

    setBubbles(newBubbles);
    setFeedback(null);
  }, [currentRound, questions]);

  const handleBubbleClick = (bubble: Bubble) => {
    if (bubble.isPopping) return;

    sounds.playPopSound();

    if (bubble.isCorrect) {
      sounds.playMatchSound();
      setBubbles(prev =>
        prev.map(b => (b.id === bubble.id ? { ...b, isPopping: true } : b))
      );
      setScore(s => s + 10 + combo * 5);
      setCombo(c => c + 1);
      setFeedback('¡Correcto! ✨');

      setTimeout(() => {
        if (currentRound + 1 >= questions.length) {
          // Juego terminado con victoria
          sounds.playVictorySound();
          setIsGameOver(true);
          const starsEarned = 5;
          completeStudySession({
            sessionType: 'review',
            durationSeconds: 45,
            totalQuestions: questions.length,
            correctAnswers: questions.length,
            starsEarned
          }).catch(() => {});
          if (onStarsEarned) onStarsEarned(starsEarned);
        } else {
          setCurrentRound(r => r + 1);
        }
      }, 700);
    } else {
      sounds.playWobbleSound();
      setCombo(0);
      setFeedback('¡Casi! Prueba otra burbuja 🫧');
    }
  };

  const currentQ = questions[currentRound];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 animate-fade-in space-y-6">
      {isGameOver && <ConfettiCelebration />}

      {/* Barra superior con volver y puntuación */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a Juegos</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-sky-100 border border-sky-300 px-3 py-1.5 rounded-full text-sky-900 font-black text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Ronda: {Math.min(currentRound + 1, questions.length)}/{questions.length}</span>
          </div>

          <div className="bg-sunny-100 border border-sunny-300 px-3 py-1.5 rounded-full text-amber-900 font-black text-sm flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>Puntos: {score}</span>
          </div>

          <button
            onClick={initGame}
            title="Reiniciar"
            className="p-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 active:scale-95 transition-all shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pregunta en tarjeta mágica con voz */}
      {currentQ && !isGameOver && (
        <div className="bg-gradient-to-r from-sky-50 via-white to-indigo-50 border-3 border-sky-200 rounded-3xl p-5 md:p-6 shadow-md text-center space-y-2 relative">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
              Pincha la burbuja correcta
            </span>
            <SpeechButton text={currentQ.question} />
          </div>

          <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
            {currentQ.question}
          </h3>

          {feedback && (
            <div className="text-xs md:text-sm font-extrabold text-magic-600 animate-bounce">
              {feedback}
            </div>
          )}
        </div>
      )}

      {/* Zona flotante de burbujas interactivas táctiles */}
      {!isGameOver && (
        <div className="relative w-full h-[360px] md:h-[420px] bg-gradient-to-b from-sky-100/50 via-blue-50/40 to-indigo-100/60 rounded-4xl border-3 border-dashed border-sky-300 overflow-hidden shadow-inner select-none p-4">
          {bubbles.map(bubble => (
            <div
              key={bubble.id}
              onClick={() => handleBubbleClick(bubble)}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`
              }}
              className={`absolute cursor-pointer transition-transform duration-300 active:scale-90 ${
                bubble.isPopping ? 'scale-150 opacity-0 transition-all duration-300' : 'animate-bounce'
              }`}
            >
              <div
                className={`w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br ${bubble.color} shadow-xl border-4 flex flex-col items-center justify-center p-3 text-center transition-all duration-200 hover:scale-105 active:scale-95`}
              >
                {/* Reflejo de luz en la burbuja */}
                <div className="absolute top-2 left-4 w-6 h-3 bg-white/40 rounded-full rotate-[-30deg]" />
                <span className="font-black text-xs md:text-sm leading-tight drop-shadow-sm">
                  {bubble.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Fin de Partida */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl p-8 max-w-sm w-full border-4 border-sky-400 shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-100 text-sky-500 flex items-center justify-center shadow-inner">
              <Trophy className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-800">¡Burbujas Cazadas!</h3>
              <p className="text-slate-600 font-bold text-sm">
                Has conseguido <span className="text-sky-600 font-black">{score} puntos</span>.
              </p>
            </div>

            <div className="bg-sunny-50 border-2 border-sunny-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-amber-800 font-black text-lg">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500 animate-bounce" />
              <span>+5 Estrellas Mágicas ganadas</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={initGame}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold active:scale-95 transition-all text-sm"
              >
                Jugar otra vez
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black active:scale-95 transition-all text-sm shadow-md shadow-sky-300"
              >
                Volver a Juegos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
