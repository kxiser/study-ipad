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
  CheckCircle2,
  GraduationCap,
  Printer
} from 'lucide-react';
import { Mascot } from '../components/Mascot.js';
import { sounds } from '../utils/soundEffects.js';
import { CURRICULUM_3_PRIMARIA, CurriculumTopic, convertTopicToExerciseSet } from '../data/curriculum3Primaria.js';

interface UnitsPageProps {
  onBack: () => void;
  onSelectUnit: (unitId: string, set: ExerciseSet) => void;
  onOpenEncyclopedia?: () => void;
  onOpenWorksheets?: () => void;
  mascotType?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Ciencias de la Naturaleza': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Ciencias Naturales': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Matemáticas': 'bg-blue-100 text-blue-800 border-blue-300',
  'Lengua Castellana': 'bg-rose-100 text-rose-800 border-rose-300',
  'Ciencias Sociales': 'bg-amber-100 text-amber-800 border-amber-300',
  'Inglés': 'bg-purple-100 text-purple-800 border-purple-300',
};

const SUBJECT_ICONS: Record<string, string> = {
  'Ciencias de la Naturaleza': '🌿',
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
  onOpenWorksheets,
  mascotType = 'chispa'
}) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'custom'>('curriculum');
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

  // Temas del currículo oficial filtrados
  const filteredCurriculum = useMemo(() => {
    if (selectedSubject === 'all') return CURRICULUM_3_PRIMARIA;
    return CURRICULUM_3_PRIMARIA.filter(t => t.subject === selectedSubject || (selectedSubject === 'Ciencias Naturales' && t.subject === 'Ciencias de la Naturaleza'));
  }, [selectedSubject]);

  // Temas guardados filtrados
  const filteredCustomUnits = useMemo(() => {
    if (selectedSubject === 'all') return uniqueUnits;
    return uniqueUnits.filter(u => u.subject === selectedSubject);
  }, [uniqueUnits, selectedSubject]);

  const handlePlayCustom = async (id: string) => {
    try {
      sounds.playPopSound();
      const set = await fetchUnit(id);
      onSelectUnit(id, set);
    } catch (e) {
      console.error('Error al cargar la unidad:', e);
    }
  };

  const handlePlayCurriculum = (topic: CurriculumTopic) => {
    sounds.playPopSound();
    const set = convertTopicToExerciseSet(topic);
    onSelectUnit(topic.id, set);
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
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fade-in relative">
      {/* Toast informativo */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-2.5 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Botón Volver y Accesos rápidos */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-magic-200 text-magic-700 font-extrabold text-sm hover:bg-magic-50 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenWorksheets && (
            <button
              onClick={onOpenWorksheets}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-sm active:scale-95 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Fichas Imprimibles PDF</span>
            </button>
          )}

          {onOpenEncyclopedia && (
            <button
              onClick={onOpenEncyclopedia}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-50 border-2 border-teal-200 text-teal-800 font-extrabold text-sm hover:bg-teal-100 active:scale-95 transition-all shadow-sm"
            >
              <Compass className="w-4 h-4 text-teal-600" />
              <span>Enciclopedia Infantil</span>
            </button>
          )}
        </div>
      </div>

      {/* Encabezado */}
      <div className="space-y-1">
        <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-50 px-3 py-1 rounded-full border border-magic-200 inline-block">
          BIBLIOTECA DE ESTUDIO
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
          Temario Oficial de 3.º de Primaria y Actividades
        </h2>
        <p className="text-slate-500 font-bold text-sm md:text-base">
          Temas estructurados por asignatura para repasar, imprimir fichas o jugar en el iPad.
        </p>
      </div>

      {/* SELECTOR DE PESTAÑAS: TEMARIO OFICIAL VS TEMAS GUARDADOS */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-3xl border border-slate-200 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
            activeTab === 'curriculum'
              ? 'bg-magic-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Temario 3.º Primaria ({CURRICULUM_3_PRIMARIA.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
            activeTab === 'custom'
              ? 'bg-magic-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Escaneados ({uniqueUnits.length})</span>
        </button>
      </div>

      {/* Barra de Filtros por Asignatura */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all border-2 active:scale-95 ${
            selectedSubject === 'all'
              ? 'bg-slate-800 text-white border-slate-800 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          🌟 Todas las materias
        </button>

        {['Lengua Castellana', 'Matemáticas', 'Ciencias de la Naturaleza', 'Ciencias Sociales'].map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all border-2 active:scale-95 flex items-center gap-2 ${
              selectedSubject === sub
                ? 'bg-magic-600 text-white border-magic-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-magic-300'
            }`}
          >
            <span>{SUBJECT_ICONS[sub] || '📚'}</span>
            <span>{sub}</span>
          </button>
        ))}
      </div>

      {/* PESTAÑA 1: TEMARIO OFICIAL DE 3.º DE PRIMARIA */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {filteredCurriculum.map(topic => (
            <div
              key={topic.id}
              className="bg-white rounded-3xl p-6 shadow-md border-2 border-magic-100 hover:border-magic-400 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${SUBJECT_COLORS[topic.subject] || 'bg-slate-100 text-slate-700'}`}>
                    <span>{SUBJECT_ICONS[topic.subject] || '📚'}</span>
                    <span>{topic.subject}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {topic.exercises.length} actividades
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                    {topic.icon} {topic.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
                    {topic.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 pt-1">
                    {topic.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handlePlayCurriculum(topic)}
                  className="px-5 py-2.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-magic-200 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Jugar y Estudiar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PESTAÑA 2: TEMAS ESCANEADOS / GUARDADOS */}
      {activeTab === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {filteredCustomUnits.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-bold">No tienes temas escaneados en esta categoría.</p>
            </div>
          ) : (
            filteredCustomUnits.map(unit => {
              const badgeClass = SUBJECT_COLORS[unit.subject] || 'bg-slate-100 text-slate-700 border-slate-200';
              const subjectIcon = SUBJECT_ICONS[unit.subject] || '📚';

              return (
                <div
                  key={unit.id}
                  className="bg-white rounded-3xl p-6 shadow-md border-2 border-magic-100 hover:border-magic-300 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${badgeClass}`}>
                        <span>{subjectIcon}</span>
                        <span>{unit.subject}</span>
                      </span>

                      <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{unit.estimated_minutes || 10} min</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-800 leading-snug line-clamp-2">
                        {unit.title}
                      </h3>
                      {unit.exercise_count && (
                        <p className="text-xs text-slate-400 font-bold mt-1">
                          {unit.exercise_count} actividades interactivas
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setUnitToDelete(unit)}
                      title="Eliminar este tema"
                      className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayCustom(unit.id)}
                      className="px-5 py-2.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-magic-200 active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Jugar ahora</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
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
