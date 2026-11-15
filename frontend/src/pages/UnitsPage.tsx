import React, { useEffect, useState, useMemo } from 'react';
import { fetchUnits, fetchUnit, deleteUnit } from '../services/api.js';
import { UnitSummary, ExerciseSet } from '../types.js';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Play,
  Sparkles,
  Compass,
  Filter,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import { Mascot } from '../components/Mascot.js';
import { sounds } from '../utils/soundEffects.js';

interface UnitsPageProps {
  onBack: () => void;
  onSelectUnit: (unitId: string, set: ExerciseSet) => void;
  onOpenEncyclopedia?: () => void;
  mascotType?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Ciencias Naturales': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Matemáticas': 'bg-blue-100 text-blue-800 border-blue-300',
  'Lengua Castellana': 'bg-rose-100 text-rose-800 border-rose-300',
  'Ciencias Sociales': 'bg-amber-100 text-amber-800 border-amber-300',
  'Inglés': 'bg-purple-100 text-purple-800 border-purple-300',
};

const SUBJECT_ICONS: Record<string, string> = {
  'Ciencias Naturales': '🌿',
  'Matemáticas': '🔢',
  'Lengua Castellana': '📖',
  'Ciencias Sociales': '🌍',
  'Inglés': '🇬🇧',
};

export const UnitsPage: React.FC<UnitsPageProps> = ({
  onBack,
  onSelectUnit,
  onOpenEncyclopedia,
  mascotType = 'chispa'
}) => {
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [unitToDelete, setUnitToDelete] = useState<UnitSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadUnits = () => {
    fetchUnits().then(data => {
      setUnits(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUnits();
  }, []);

  // Deduplicar temas repetidos por título normalizado
  const uniqueUnits = useMemo(() => {
    const seen = new Set<string>();
    return units.filter(u => {
      const key = u.title.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [units]);

  // Lista de materias disponibles con conteos
  const subjectsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of uniqueUnits) {
      counts[u.subject] = (counts[u.subject] || 0) + 1;
    }
    return counts;
  }, [uniqueUnits]);

  // Temas filtrados por la materia seleccionada
  const filteredUnits = useMemo(() => {
    if (selectedSubject === 'all') return uniqueUnits;
    return uniqueUnits.filter(u => u.subject === selectedSubject);
  }, [uniqueUnits, selectedSubject]);

  const handlePlay = async (unitId: string) => {
    try {
      const fullUnit = await fetchUnit(unitId);
      onSelectUnit(unitId, fullUnit);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;
    setIsDeleting(true);
    sounds.playPopSound();

    try {
      const success = await deleteUnit(unitToDelete.id);
      if (success) {
        setUnits(prev => prev.filter(u => u.id !== unitToDelete.id));
        setToastMessage(`El tema "${unitToDelete.title}" ha sido eliminado.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (e) {
      console.error('Error al eliminar unidad:', e);
    } finally {
      setIsDeleting(false);
      setUnitToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fade-in relative">
      {/* Toast informativo */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-2.5 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Botón Volver y Acceso rápido a Enciclopedia */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 font-extrabold hover:text-magic-600 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Inicio</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenEncyclopedia && (
            <button
              type="button"
              onClick={onOpenEncyclopedia}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-xs shadow-md shadow-amber-200 hover:scale-105 active:scale-95 transition-all"
            >
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>Descubrir Temas Nuevos</span>
            </button>
          )}

          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-mint-100 px-3 py-1.5 rounded-full">
            📚 {uniqueUnits.length} Temas Únicos
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800">
          Tus Temas y Actividades Guardadas
        </h2>
        <p className="text-slate-500 font-bold text-sm md:text-base">
          Temas organizados por materia para repasar, jugar o eliminar cuando ya los domines.
        </p>
      </div>

      {/* Pestañas de Filtrado por Materia (Agrupación) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedSubject('all')}
          className={`px-4 py-2 rounded-2xl font-black text-xs whitespace-nowrap transition-all shadow-sm ${
            selectedSubject === 'all'
              ? 'bg-magic-600 text-white shadow-magic-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🌟 Todos los temas ({uniqueUnits.length})
        </button>

        {Object.entries(subjectsWithCounts).map(([subject, count]) => {
          const icon = SUBJECT_ICONS[subject] || '📖';
          const isSelected = selectedSubject === subject;

          return (
            <button
              key={subject}
              type="button"
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-2xl font-black text-xs whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-magic-600 text-white shadow-magic-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{icon}</span>
              <span>{subject}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Mascot mascotType={mascotType} mood="thinking" size="md" message="Cargando tus temas..." />
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="bg-white rounded-4xl p-8 text-center space-y-4 border-2 border-slate-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-700">No hay temas en esta materia todavía</h3>
          <p className="text-slate-500 text-sm">
            Puedes escanear tu libro o buscar temas en la enciclopedia infantil para añadirlos.
          </p>
          {onOpenEncyclopedia && (
            <button
              type="button"
              onClick={onOpenEncyclopedia}
              className="px-6 py-3 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm inline-flex items-center gap-2 shadow-lg shadow-magic-200"
            >
              <Compass className="w-5 h-5" />
              <span>Explorar Enciclopedia Infantil</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUnits.map(unit => {
            const badgeStyle = SUBJECT_COLORS[unit.subject] || 'bg-slate-100 text-slate-800 border-slate-300';
            const icon = SUBJECT_ICONS[unit.subject] || '📚';

            return (
              <div
                key={unit.id}
                className="bg-white rounded-3xl p-6 shadow-md border-2 border-magic-100 hover:border-magic-300 transition-all flex flex-col justify-between gap-4 group relative"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1 ${badgeStyle}`}>
                      <span>{icon}</span>
                      <span>{unit.subject}</span>
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

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <span className="text-xs font-black text-magic-600">
                    {unit.exercise_count} actividades
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Botón Eliminar Tema */}
                    <button
                      type="button"
                      onClick={() => setUnitToDelete(unit)}
                      title="Eliminar tema"
                      className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Botón Jugar */}
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
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINAR TEMA */}
      {unitToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-4xl p-6 sm:p-8 max-w-md w-full border-4 border-rose-300 shadow-2xl space-y-5 animate-scale-up text-center">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 border-2 border-rose-300 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-block">
                Eliminar tema
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                ¿Seguro que deseas eliminar este tema?
              </h3>
              <p className="text-sm font-semibold text-slate-600 px-2">
                Se borrará <strong className="text-slate-800">"{unitToDelete.title}"</strong> y sus {unitToDelete.exercise_count || ''} ejercicios de tu lista.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnitToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
