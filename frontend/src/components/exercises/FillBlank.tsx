import React, { useState } from 'react';
import { FillBlankExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  exercise: FillBlankExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const FillBlank: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  const [chosenWord, setChosenWord] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Dividir texto por '___' o '[...]'
  const parts = exercise.textWithBlank.split(/(?:___|\[\.\.\.\])/);

  const handleWordClick = (word: string) => {
    if (hasAnswered) return;
    setChosenWord(word);
  };

  const handleResetWord = () => {
    if (hasAnswered) return;
    setChosenWord(null);
  };

  const handleCheck = () => {
    if (!chosenWord || hasAnswered) return;
    setHasAnswered(true);

    const isCorrect = chosenWord.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      fireSuccessConfetti();
    }
    onAnswer(isCorrect);
  };

  const isCorrect = chosenWord?.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

  return (
    <div className="space-y-6">
      {/* Oración con el hueco */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-magic-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-magic-600">
            Completa la palabra que falta
          </span>
          <SpeechButton
            text={
              chosenWord
                ? `${parts[0]} ${chosenWord} ${parts[1] || ''}`
                : `Completa la palabra que falta en esta frase: ${exercise.textWithBlank}`
            }
            size="sm"
          />
        </div>

        <div className="text-xl md:text-2xl font-black text-slate-800 leading-loose flex flex-wrap items-center gap-2">
          <span>{parts[0]}</span>

          {/* El Hueco en blanco */}
          <button
            type="button"
            onClick={handleResetWord}
            disabled={hasAnswered || !chosenWord}
            className={`min-w-[140px] px-4 py-2 rounded-2xl border-2 font-black transition-all inline-flex items-center justify-center gap-2 ${
              hasAnswered
                ? isCorrect
                  ? 'bg-mint-100 border-mint-500 text-emerald-900 ring-4 ring-mint-200'
                  : 'bg-bubble-100 border-bubble-400 text-rose-900'
                : chosenWord
                ? 'bg-magic-100 border-magic-500 text-magic-900 shadow-md animate-scale-up'
                : 'bg-amber-50 border-dashed border-amber-300 text-amber-600 shadow-inner'
            }`}
          >
            <span>{chosenWord || '¿ Qué palabra ?'}</span>
            {chosenWord && !hasAnswered && (
              <RotateCcw className="w-4 h-4 text-magic-500 hover:rotate-180 transition-transform" />
            )}
          </button>

          <span>{parts[1] || ''}</span>
        </div>
      </div>

      {/* Fichas de palabras para elegir */}
      <div>
        <p className="text-sm font-bold text-slate-500 mb-3 text-center">
          Toca una palabra para colocarla en el hueco:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {exercise.options.map((word, idx) => {
            const isSelected = chosenWord === word;
            return (
              <button
                key={idx}
                type="button"
                disabled={hasAnswered}
                onClick={() => handleWordClick(word)}
                className={`px-6 py-4 rounded-2xl border-2 font-black text-lg md:text-xl shadow-sm transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-magic-600 text-white border-magic-600 shadow-magic-300 scale-105'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-magic-50 hover:border-magic-300'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón Comprobar */}
      {!hasAnswered && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={!chosenWord}
            onClick={handleCheck}
            className={`px-10 py-4 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 ${
              chosenWord
                ? 'bg-magic-600 hover:bg-magic-700 text-white shadow-magic-300'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            ¡Comprobar Respuesta!
          </button>
        </div>
      )}

      {/* Explicación y botón siguiente */}
      {hasAnswered && (
        <div className="bg-magic-50 border-2 border-magic-200 rounded-3xl p-5 md:p-6 shadow-sm animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider text-magic-600">
              {isCorrect ? '¡Has acertado la palabra perfecta!' : `La palabra correcta era: "${exercise.correctAnswer}"`}
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
