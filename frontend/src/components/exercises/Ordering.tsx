import React, { useState } from 'react';
import { OrderingExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { ChevronUp, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  exercise: OrderingExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

// Mezclar array sin que coincida con el orden perfecto inicial
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  // Si coincide exactamente, intercambiar dos elementos
  if (JSON.stringify(copy) === JSON.stringify(array) && copy.length > 1) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}

export const Ordering: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  const [currentOrder, setCurrentOrder] = useState<string[]>(() => shuffleArray(exercise.items));
  const [hasAnswered, setHasAnswered] = useState(false);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (hasAnswered) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const updated = [...currentOrder];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCurrentOrder(updated);
  };

  const handleCheck = () => {
    if (hasAnswered) return;
    setHasAnswered(true);

    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(exercise.items);
    if (isCorrect) {
      fireSuccessConfetti();
    }
    onAnswer(isCorrect);
  };

  const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(exercise.items);

  return (
    <div className="space-y-6">
      {/* Instrucción */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-magic-100 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-magic-600 block mb-2">
            Ordena los pasos correctamente
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
            {exercise.instruction}
          </h2>
        </div>
        <SpeechButton text={`Ordena los siguientes pasos: ${exercise.instruction}`} size="md" />
      </div>

      {/* Lista de pasos con flechas táctiles grandes */}
      <div className="space-y-3">
        {currentOrder.map((item, idx) => {
          const isItemInCorrectPos = item === exercise.items[idx];

          let borderStyle = 'border-slate-200 bg-white';
          if (hasAnswered) {
            borderStyle = isItemInCorrectPos
              ? 'border-mint-400 bg-mint-50 text-emerald-950'
              : 'border-bubble-300 bg-bubble-50 text-rose-950';
          }

          return (
            <div
              key={idx}
              className={`p-4 md:p-5 rounded-2xl border-2 shadow-sm flex items-center justify-between gap-4 transition-all ${borderStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-magic-100 text-magic-700 font-black text-sm flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-bold text-base md:text-lg text-slate-800">{item}</span>
              </div>

              {!hasAnswered && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, 'up')}
                    className={`p-3 rounded-xl border border-slate-200 bg-slate-50 transition-transform active:scale-90 ${
                      idx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-magic-100 text-magic-700'
                    }`}
                    title="Mover arriba"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === currentOrder.length - 1}
                    onClick={() => moveItem(idx, 'down')}
                    className={`p-3 rounded-xl border border-slate-200 bg-slate-50 transition-transform active:scale-90 ${
                      idx === currentOrder.length - 1
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-magic-100 text-magic-700'
                    }`}
                    title="Mover abajo"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón Comprobar */}
      {!hasAnswered && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleCheck}
            className="px-10 py-4 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-lg shadow-lg shadow-magic-300 transition-all active:scale-95"
          >
            ¡Comprobar el Orden!
          </button>
        </div>
      )}

      {/* Explicación y botón siguiente */}
      {hasAnswered && (
        <div className="bg-magic-50 border-2 border-magic-200 rounded-3xl p-5 md:p-6 shadow-sm animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider text-magic-600">
              {isCorrect ? '¡Has ordenado la secuencia perfectamente!' : '¡Casi! Este es el orden ideal:'}
            </span>
            <p className="text-slate-700 font-bold text-base md:text-lg mt-1">
              {exercise.explanation}
            </p>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-magic-300 active:scale-95 transition-all shrink-0"
          >
            <span>Siguiente</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
