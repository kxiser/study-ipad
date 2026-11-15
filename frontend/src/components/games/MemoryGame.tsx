import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { ExerciseItem } from '../../types.js';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { completeStudySession } from '../../services/api.js';

interface MemoryCard {
  id: string;
  pairId: string;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: 'prompt' | 'target';
}

interface MemoryGameProps {
  exercises: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  exercises,
  title = 'Memory Mágico',
  onBack,
  onStarsEarned
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPairs, setTotalPairs] = useState(6);

  // Inicializar cartas extrayendo parejas de los ejercicios
  const initGame = () => {
    const rawPairs: Array<{ prompt: string; target: string }> = [];

    exercises.forEach(ex => {
      if (ex.type === 'matching' && ex.pairs?.length) {
        ex.pairs.forEach(p => rawPairs.push({ prompt: p.left, target: p.right }));
      } else if (ex.type === 'flashcard' && ex.front && ex.back) {
        rawPairs.push({ prompt: ex.front, target: ex.back });
      } else if (ex.type === 'multiple_choice' && ex.question && ex.correctAnswer) {
        rawPairs.push({ prompt: ex.question, target: ex.correctAnswer });
      } else if (ex.type === 'true_false' && ex.statement) {
        rawPairs.push({ prompt: ex.statement, target: ex.isTrue ? 'Verdadero' : 'Falso' });
      }
    });

    // Barajar parejas y elegir máximo 6 (12 cartas en total para que quepa bien en iPad)
    const shuffledPairs = [...rawPairs].sort(() => Math.random() - 0.5).slice(0, 6);
    if (shuffledPairs.length < 3) {
      // Si hay pocas, rellenar con datos divertidos de estudio
      shuffledPairs.push(
        { prompt: '¿Cuántos continentes hay?', target: '6 grandes continentes' },
        { prompt: 'Animales con huesos', target: 'Vertebrados' },
        { prompt: 'Animales sin huesos', target: 'Invertebrados' },
        { prompt: '3 × 4', target: '12' }
      );
    }

    const selected = shuffledPairs.slice(0, 6);
    setTotalPairs(selected.length);

    const generatedCards: MemoryCard[] = [];
    selected.forEach((pair, idx) => {
      generatedCards.push({
        id: `card-${idx}-p`,
        pairId: `pair-${idx}`,
        text: pair.prompt,
        isFlipped: false,
        isMatched: false,
        type: 'prompt'
      });
      generatedCards.push({
        id: `card-${idx}-t`,
        pairId: `pair-${idx}`,
        text: pair.target,
        isFlipped: false,
        isMatched: false,
        type: 'target'
      });
    });

    // Barajar todas las cartas
    setCards(generatedCards.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMatchedPairsCount(0);
    setMoves(0);
    setIsWon(false);
    setIsProcessing(false);
  };

  useEffect(() => {
    initGame();
  }, [exercises]);

  const handleCardClick = (index: number) => {
    if (isProcessing) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    sounds.playFlipSound();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsProcessing(true);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // ¡Coincidencia!
        setTimeout(() => {
          sounds.playMatchSound();
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setIsProcessing(false);

          const newMatchCount = matchedPairsCount + 1;
          setMatchedPairsCount(newMatchCount);

          if (newMatchCount >= totalPairs) {
            // ¡Victoria!
            setTimeout(() => {
              sounds.playVictorySound();
              setIsWon(true);
              const starsEarned = 5;
              completeStudySession({
                sessionType: 'review',
                durationSeconds: 60,
                totalQuestions: totalPairs,
                correctAnswers: totalPairs,
                starsEarned
              }).catch(() => {});
              if (onStarsEarned) onStarsEarned(starsEarned);
            }, 600);
          }
        }, 500);
      } else {
        // No coinciden
        setTimeout(() => {
          sounds.playWobbleSound();
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1100);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 animate-fade-in space-y-6">
      {isWon && <ConfettiCelebration />}

      {/* Barra superior con volver y estadísticas */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a Juegos</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-sunny-100 border border-sunny-300 px-3 py-1.5 rounded-full text-amber-900 font-black text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Parejas: {matchedPairsCount}/{totalPairs}</span>
          </div>

          <div className="bg-magic-100 border border-magic-200 px-3 py-1.5 rounded-full text-magic-900 font-black text-sm">
            Movimientos: {moves}
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

      {/* Cabecera del juego */}
      <div className="text-center space-y-1">
        <span className="inline-block bg-bubble-100 text-bubble-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-bubble-200">
          🃏 Entrenamiento de Memoria
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800">{title}</h2>
        <p className="text-xs md:text-sm font-semibold text-slate-500">
          Encuentra las parejas que corresponden a las preguntas y respuestas de tus temas.
        </p>
      </div>

      {/* Tablero de Cartas en Grid responsivo */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4 select-none">
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`h-28 sm:h-36 rounded-3xl p-3 flex items-center justify-center text-center cursor-pointer transition-all duration-300 transform active:scale-95 shadow-md ${
                card.isMatched
                  ? 'bg-mint-100 border-3 border-mint-400 text-mint-900 opacity-90 scale-98 shadow-sm'
                  : isRevealed
                  ? card.type === 'prompt'
                    ? 'bg-white border-3 border-magic-400 text-slate-800 shadow-lg scale-102 font-bold text-xs sm:text-sm'
                    : 'bg-sunny-50 border-3 border-amber-400 text-amber-950 shadow-lg scale-102 font-extrabold text-xs sm:text-sm'
                  : 'bg-gradient-to-br from-magic-500 to-indigo-600 border-3 border-magic-400 hover:from-magic-600 hover:to-indigo-700 text-white'
              }`}
            >
              {isRevealed ? (
                <div className="flex flex-col items-center justify-center gap-1.5 p-1 animate-fade-in w-full">
                  {card.isMatched && (
                    <CheckCircle2 className="w-5 h-5 text-mint-600 shrink-0" />
                  )}
                  <p className="leading-snug break-words line-clamp-4">
                    {card.text}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 text-magic-200">
                  <Star className="w-8 h-8 fill-magic-300 text-magic-300 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-magic-200">
                    Mágico
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Victoria al finalizar */}
      {isWon && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl p-8 max-w-sm w-full border-4 border-sunny-400 shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-sunny-100 text-amber-500 flex items-center justify-center shadow-inner">
              <Trophy className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-800">¡Súper Campeona!</h3>
              <p className="text-slate-600 font-bold text-sm">
                Has encontrado todas las parejas en {moves} movimientos.
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
                className="flex-1 py-3 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black active:scale-95 transition-all text-sm shadow-md shadow-magic-300"
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
