import React, { useEffect, useState } from 'react';
import { fetchUnits, fetchUnit } from '../services/api.js';
import { UnitSummary, ExerciseSet } from '../types.js';
import { ArrowLeft, BookOpen, Clock, Play, Sparkles } from 'lucide-react';
import { Mascot } from '../components/Mascot.js';

interface UnitsPageProps {
  onBack: () => void;
  onSelectUnit: (unitId: string, set: ExerciseSet) => void;
  mascotType?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Ciencias Naturales': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Matemáticas': 'bg-blue-100 text-blue-800 border-blue-300',
  'Lengua Castellana': 'bg-rose-100 text-rose-800 border-rose-300',
  'Ciencias Sociales': 'bg-amber-100 text-amber-800 border-amber-300',
  'Inglés': 'bg-purple-100 text-purple-800 border-purple-300',
};

export const UnitsPage: React.FC<UnitsPageProps> = ({ onBack, onSelectUnit, mascotType = 'chispa' }) => {
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnits().then(data => {
      setUnits(data);
      setLoading(false);
    });
  }, []);

  const handlePlay = async (unitId: string) => {
    try {
      const fullUnit = await fetchUnit(unitId);
      onSelectUnit(unitId, fullUnit);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fade-in">
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 font-extrabold hover:text-magic-600 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Inicio</span>
        </button>

        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-mint-100 px-3 py-1 rounded-full">
          📚 Biblioteca de Temas
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800">
          Tus Temas y Actividades Guardadas
        </h2>
        <p className="text-slate-500 font-bold text-sm md:text-base">
          Puedes volver a jugar cualquiera de estos temas en tu iPad tantas veces como quieras.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Mascot mascotType={mascotType} mood="thinking" size="md" message="Cargando tus temas..." />
        </div>
      ) : units.length === 0 ? (
        <div className="bg-white rounded-4xl p-8 text-center space-y-4 border-2 border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-700">Aún no tienes temas guardados</h3>
          <p className="text-slate-500 text-sm">Escanea tu primer libro para crear actividades divertidas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units.map(unit => {
            const badgeStyle = SUBJECT_COLORS[unit.subject] || 'bg-slate-100 text-slate-800 border-slate-300';
            return (
              <div
                key={unit.id}
                className="bg-white rounded-3xl p-6 shadow-md border-2 border-magic-100 hover:border-magic-300 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-3 py-1 rounded-full border ${badgeStyle}`}>
                      {unit.subject}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{unit.estimated_minutes || 7} min</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 leading-snug">
                    {unit.title}
                  </h3>
                  <p className="text-slate-600 text-sm font-medium line-clamp-2">
                    {unit.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-black text-magic-600">
                    {unit.exercise_count} actividades
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePlay(unit.id)}
                    className="px-5 py-2.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-magic-200 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Jugar ahora</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
