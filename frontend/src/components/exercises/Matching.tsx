import React, { useState } from 'react';
import { MatchingExercise } from '../../types.js';
import { SpeechButton } from '../SpeechButton.js';
import { fireSuccessConfetti } from '../ConfettiCelebration.js';
import { Check, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  exercise: MatchingExercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

// Colores para las parejas encontradas
const PAIR_COLORS = [
  'bg-emerald-100 border-emerald-400 text-emerald-900',
  'bg-indigo-100 border-indigo-400 text-indigo-900',
  'bg-amber-100 border-amber-400 text-amber-900',
  'bg-pink-100 border-pink-400 text-pink-900',
  'bg-cyan-100 border-cyan-400 text-cyan-900'
];

export const Matching: React.FC<Props> = ({ exercise, onAnswer, onNext }) => {
  // Filtrar parejas para eliminar cualquier dummy como 'Concepto' / 'Definición'
  const validPairs = React.useMemo(() => {
    const list = (exercise.pairs || []).filter(p => {
      const l = p.left.trim().toLowerCase();
      const r = p.right.trim().toLowerCase();
      return l !== 'concepto' && r !== 'definición' && r !== 'definicion' && l !== '' && r !== '';
    });
    return list.length >= 2 ? list : exercise.pairs;
  }, [exercise.pairs]);

  // Mezclar columna derecha al inicio
  const [shuffledRights] = useState(() => {
    const list = validPairs.map(p => p.right);
    return list.sort(() => Math.random() - 0.5);
  });

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, { right: string; colorIdx: number }>>({});
  const [hasAnswered, setHasAnswered] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);

  const handleLeftClick = (leftText: string) => {
    if (hasAnswered || matchedPairs[leftText]) return;
    setSelectedLeft(leftText);
  };

  const handleRightClick = (rightText: string) => {
    if (hasAnswered || !selectedLeft) return;

    // Verificar si ya está emparejado
    const alreadyMatched = Object.values(matchedPairs).some(v => v.right === rightText);
    if (alreadyMatched) return;

    // Comprobar si esta pareja es correcta
    const targetPair = validPairs.find(p => p.left === selectedLeft);
    if (targetPair && targetPair.right === rightText) {
      // Pareja correcta
      const newMatches = {
        ...matchedPairs,
        [selectedLeft]: { right: rightText, colorIdx: Object.keys(matchedPairs).length % PAIR_COLORS.length }
      };
      setMatchedPairs(newMatches);
      setSelectedLeft(null);

      // Si ha completado todas las parejas
      if (Object.keys(newMatches).length === validPairs.length) {
        setHasAnswered(true);
        const wasPerfect = mistakeCount === 0;
        fireSuccessConfetti();
        onAnswer(wasPerfect);
      }
    } else {
      // Pareja incorrecta
      setMistakeCount(prev => prev + 1);
      // Vibración visual: deseleccionar tras un instante
      setSelectedLeft(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instrucción */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-magic-100 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-magic-600 block mb-2">
            Une con flechas o parejas
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
            {exercise.instruction}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Toca una ficha de la izquierda y luego su pareja a la derecha.
          </p>
        </div>
        <SpeechButton text={`Une cada pareja: ${exercise.instruction}`} size="md" />
      </div>

      {/* Dos Columnas */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Columna Izquierda */}
        <div className="space-y-3">
          <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-slate-500 text-center bg-slate-100 py-2 rounded-xl">
            🏷️ Fichas
          </h3>
          {validPairs.map((p, idx) => {
            const isMatched = Boolean(matchedPairs[p.left]);
            const isSelected = selectedLeft === p.left;
            const matchInfo = matchedPairs[p.left];

            return (
              <button
                key={idx}
                type="button"
                disabled={isMatched || hasAnswered}
                onClick={() => handleLeftClick(p.left)}
                className={`w-full min-h-[75px] md:min-h-[85px] p-4 md:p-5 rounded-3xl border-3 text-base md:text-xl font-black text-left flex items-center justify-between transition-all duration-150 active:scale-95 shadow-sm ${
                  isMatched
                    ? `${PAIR_COLORS[matchInfo.colorIdx]} ring-4 ring-emerald-300`
                    : isSelected
                    ? 'bg-magic-100 border-magic-600 text-magic-950 scale-102 ring-4 ring-magic-200 shadow-md'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-magic-50 hover:border-magic-300'
                }`}
              >
                <span>{p.left}</span>
                {isMatched && <Check className="w-6 h-6 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Columna Derecha */}
        <div className="space-y-3">
          <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-slate-500 text-center bg-slate-100 py-2 rounded-xl">
            🎯 Parejas
          </h3>
          {shuffledRights.map((rightText, idx) => {
            const matchedLeft = Object.keys(matchedPairs).find(k => matchedPairs[k].right === rightText);
            const isMatched = Boolean(matchedLeft);
            const matchInfo = matchedLeft ? matchedPairs[matchedLeft] : null;

            return (
              <button
                key={idx}
                type="button"
                disabled={isMatched || hasAnswered}
                onClick={() => handleRightClick(rightText)}
                className={`w-full min-h-[75px] md:min-h-[85px] p-4 md:p-5 rounded-3xl border-3 text-base md:text-xl font-black text-left flex items-center justify-between transition-all duration-150 active:scale-95 shadow-sm ${
                  isMatched && matchInfo
                    ? `${PAIR_COLORS[matchInfo.colorIdx]} ring-4 ring-emerald-300`
                    : selectedLeft
                    ? 'bg-amber-50 border-amber-300 text-slate-800 hover:bg-amber-100 hover:border-amber-400'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{rightText}</span>
                {isMatched && <Check className="w-6 h-6 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explicación y botón siguiente */}
      {hasAnswered && (
        <div className="bg-magic-50 border-2 border-magic-200 rounded-3xl p-5 md:p-6 shadow-sm animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider text-magic-600">
              ¡Todas las parejas unidas con éxito!
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
