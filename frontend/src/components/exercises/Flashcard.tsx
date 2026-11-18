import React, { useState } from 'react';
import { FlashcardExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { RotateCw, Sparkles, Check, ArrowRight, Lightbulb } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';

interface Props {
  exercise: FlashcardExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

// Tipografía responsiva y adaptativa para que el texto nunca desborde
const getFrontFontSize = (text: string) => {
  if (text.length > 120) return 'text-base sm:text-lg md:text-xl font-bold leading-relaxed';
  if (text.length > 60) return 'text-lg sm:text-xl md:text-2xl font-extrabold leading-snug';
  return 'text-2xl sm:text-3xl font-black leading-snug';
};

const getBackFontSize = (text: string) => {
  if (text.length > 140) return 'text-sm sm:text-base md:text-lg font-bold leading-relaxed';
  if (text.length > 70) return 'text-base sm:text-lg md:text-xl font-extrabold leading-snug';
  return 'text-xl sm:text-2xl md:text-3xl font-black leading-snug';
};

export const Flashcard: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleFlip = () => {
    sounds.playFlipSound();
    setIsFlipped(!isFlipped);
  };

  const handleSelfGrade = (knewIt: boolean) => {
    if (hasAnswered) return;
    setHasAnswered(true);

    if (knewIt) {
      fireSuccessConfetti();
      sounds.playMatchSound();
    } else {
      sounds.playWobbleSound();
    }
    onAnswer(knewIt);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-50 px-3.5 py-1.5 rounded-full border border-magic-200 inline-block shadow-sm">
          Tarjeta Mágica de Repaso
        </span>
        <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1.5">
          Toca la tarjeta para voltearla y ver la respuesta
        </p>
      </div>

      {/* Tarjeta con efecto 3D real y protección contra desbordamiento */}
      <div
        onClick={handleFlip}
        className="cursor-pointer min-h-[380px] sm:min-h-[420px] perspective-1000 select-none relative"
      >
        <div
          className={`relative w-full min-h-[380px] sm:min-h-[420px] transition-transform duration-600 ease-in-out transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* CARA A: ANVERSO (PREGUNTA) */}
          <div className="absolute inset-0 backface-hidden rounded-4xl p-5 sm:p-7 flex flex-col justify-between bg-gradient-to-br from-magic-600 via-indigo-600 to-purple-700 border-4 border-magic-400 text-white shadow-2xl overflow-hidden">
            {/* Encabezado */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white shadow-sm border border-white/30 flex items-center gap-1.5">
                <span>❓</span>
                <span>Pregunta</span>
              </span>

              <div onClick={e => e.stopPropagation()}>
                <SpeechButton
                  text={exercise.front}
                  size="sm"
                  className="!bg-white/20 !text-white !border-white/30 hover:!bg-white/30"
                />
              </div>
            </div>

            {/* Contenido Central con scroll seguro y tipografía adaptativa */}
            <div className="my-auto py-3 text-center px-2 sm:px-4 overflow-y-auto max-h-[250px] sm:max-h-[290px] scrollbar-thin">
              <span className="text-4xl sm:text-5xl mb-2.5 block">💡</span>
              <p className={`${getFrontFontSize(exercise.front)} text-white drop-shadow-sm`}>
                {exercise.front}
              </p>
            </div>

            {/* Pie */}
            <div className="shrink-0 flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-white/80 bg-black/15 py-2.5 rounded-2xl">
              <RotateCw className="w-4 h-4 animate-spin-slow" />
              <span>Toca en cualquier parte para girar</span>
            </div>
          </div>

          {/* CARA B: REVERSO (RESPUESTA Y EXPLICACIÓN) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-4xl p-5 sm:p-7 flex flex-col justify-between bg-gradient-to-br from-amber-50 via-white to-sunny-100 border-4 border-amber-300 text-slate-800 shadow-2xl overflow-hidden">
            {/* Encabezado */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-200 text-amber-950 shadow-sm border border-amber-300 flex items-center gap-1.5">
                <span>✨</span>
                <span>Respuesta correcta</span>
              </span>

              <div onClick={e => e.stopPropagation()}>
                <SpeechButton
                  text={`${exercise.back}. ${exercise.tip ? `Truco: ${exercise.tip}` : ''}`}
                  size="sm"
                />
              </div>
            </div>

            {/* Contenido Central con scroll seguro y tipografía adaptativa */}
            <div className="my-auto py-3 text-center px-2 sm:px-4 space-y-2.5 overflow-y-auto max-h-[250px] sm:max-h-[290px] scrollbar-thin">
              <span className="text-3xl sm:text-4xl mb-1 block">🎯</span>
              <p className={`${getBackFontSize(exercise.back)} text-slate-900`}>
                {exercise.back}
              </p>

              {exercise.tip && (
                <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-950 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-bold border border-amber-300 shadow-sm mt-1">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Truco para recordar: <strong>{exercise.tip}</strong></span>
                </div>
              )}
            </div>

            {/* Pie */}
            <div className="shrink-0 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 py-2.5 rounded-2xl">
              <RotateCw className="w-4 h-4" />
              <span>Toca para volver a ver la pregunta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de autoevaluación cuando la tarjeta está girada */}
      {isFlipped && !hasAnswered && (
        <div className="space-y-3 animate-fade-in text-center pt-4 relative z-10">
          <p className="text-sm sm:text-base font-black text-slate-700">
            ¿Te acordabas de la respuesta?
          </p>
          <div className="grid grid-cols-2 gap-3.5 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => handleSelfGrade(false)}
              className="min-h-[52px] py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-sm sm:text-base active:scale-95 transition-all border-2 border-slate-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Necesito repasarlo</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelfGrade(true)}
              className="min-h-[52px] py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm sm:text-base active:scale-95 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>¡Me la sabía!</span>
            </button>
          </div>
        </div>
      )}

      {/* Botón Siguiente cuando ya se autoevaluó */}
      {hasAnswered && (
        <div className="flex justify-end pt-4 animate-fade-in relative z-10">
          <button
            type="button"
            onClick={onNext}
            className="min-h-[52px] px-7 py-3.5 rounded-2xl bg-gradient-to-r from-magic-600 to-indigo-600 hover:from-magic-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-magic-300 active:scale-95 transition-all cursor-pointer"
          >
            <span>Siguiente pregunta</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
