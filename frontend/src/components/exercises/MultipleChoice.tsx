import React, { useState } from 'react';
import { MultipleChoiceExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Props {
  exercise: MultipleChoiceExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

const OPTION_COLORS = [
  'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-950',
  'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-950',
  'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-950',
  'bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-950'
];

export const MultipleChoice: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const norm = (s: string) => (s || '').trim().toLowerCase().replace(/[\.\,\!]$/, '');

  const handleSelect = (option: string) => {
    if (hasAnswered) return;
    setSelected(option);
    setHasAnswered(true);

    const isCorrect = norm(option) === norm(exercise.correctAnswer);
    if (isCorrect) {
      fireSuccessConfetti();
    }
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-6">
      {/* Pregunta */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-magic-100 flex items-start justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
          {exercise.question}
        </h2>
        <SpeechButton text={exercise.question} size="md" />
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exercise.options.map((option, idx) => {
          let stateStyle = OPTION_COLORS[idx % OPTION_COLORS.length];
          const isThisCorrect = norm(option) === norm(exercise.correctAnswer);

          if (hasAnswered) {
            if (isThisCorrect) {
              stateStyle = 'bg-mint-100 border-mint-500 text-emerald-900 ring-4 ring-mint-300';
            } else if (option === selected) {
              stateStyle = 'bg-bubble-100 border-bubble-400 text-rose-900';
            } else {
              stateStyle = 'bg-slate-50 border-slate-200 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelect(option)}
              className={`min-h-[70px] md:min-h-[85px] p-5 rounded-3xl border-3 text-lg md:text-xl font-bold flex items-center justify-between transition-all duration-200 active:scale-98 shadow-sm ${stateStyle}`}
            >
              <div className="flex items-center gap-3 text-left">
                <span className="w-9 h-9 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center font-black text-sm text-slate-700">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>

              {hasAnswered && isThisCorrect && (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 animate-bounce" />
              )}
              {hasAnswered && option === selected && !isThisCorrect && (
                <XCircle className="w-7 h-7 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explicación y botón siguiente */}
      {hasAnswered && (
        <div className="bg-magic-50 border-2 border-magic-200 rounded-3xl p-5 md:p-6 shadow-sm animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider text-magic-600">
              {selected === exercise.correctAnswer ? '¡Excelente respuesta!' : '¡Casi! Vamos a repasar:'}
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
