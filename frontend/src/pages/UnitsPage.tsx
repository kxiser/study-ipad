import React, { useEffect, useState, useMemo } from 'react';
import { fetchUnits, fetchUnit, deleteUnit } from '../services/api.js';
import { UnitSummary, ExerciseSet, ExerciseItem } from '../types.js';
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
  Printer,
  CheckSquare,
  Square,
  Layers,
  FolderOpen
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

// Función para extraer palabra clave raíz de un tema y agrupar duplicados
function getClusterKey(title: string): string {
  const clean = title.toLowerCase()
    .replace(/[¡!¿?]/g, '')
    .replace(/\b(el|la|los|las|de|del|en|y|nuestro|nuestra|un|una|mundo|exploramos|exploradores|aventura)\b/g, '')
    .trim();
  if (clean.includes('montaña')) return 'La Montaña y el Relieve';
  if (clean.includes('paisaje') || clean.includes('llanura') || clean.includes('relieve')) return 'Paisajes y Relieve de España';
  if (clean.includes('seres vivos') || clean.includes('animal') || clean.includes('vertebrado')) return 'Seres Vivos y Reino Animal';
  if (clean.includes('tierra') || clean.includes('planeta') || clean.includes('solar')) return 'El Planeta Tierra y el Espacio';
  if (clean.includes('agua')) return 'El Agua y la Naturaleza';
  if (clean.includes('aguda') || clean.includes('llana') || clean.includes('tilde') || clean.includes('acentu')) return 'Acentuación y Ortografía';
  if (clean.includes('tabla') || clean.includes('multiplic') || clean.includes('cálculo')) return 'Tablas y Multiplicación';
  if (clean.includes('reloj') || clean.includes('hora') || clean.includes('medida')) return 'El Reloj y las Medidas';
  if (clean.includes('sustantiv') || clean.includes('adjetiv') || clean.includes('verbo')) return 'Gramática Española';
  return title.trim();
}

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

  // Selección multi-tema para repasar más de uno a la vez
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [groupByTheme, setGroupByTheme] = useState<boolean>(true);

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

  // Agrupar temas escaneados similares por núcleo semántico
  const groupedCustomUnits = useMemo(() => {
    const groups: Record<string, { groupName: string; subject: string; units: UnitSummary[]; totalExercises: number }> = {};

    uniqueUnits.forEach(u => {
      const clusterKey = getClusterKey(u.title);
      if (!groups[clusterKey]) {
        groups[clusterKey] = {
          groupName: clusterKey,
          subject: u.subject,
          units: [],
          totalExercises: 0
        };
      }
      groups[clusterKey].units.push(u);
      groups[clusterKey].totalExercises += (u.exercise_count || 5);
    });

    return Object.values(groups);
  }, [uniqueUnits]);

  // Temas del currículo oficial filtrados
  const filteredCurriculum = useMemo(() => {
    if (selectedSubject === 'all') return CURRICULUM_3_PRIMARIA;
    return CURRICULUM_3_PRIMARIA.filter(t => t.subject === selectedSubject || (selectedSubject === 'Ciencias Naturales' && t.subject === 'Ciencias de la Naturaleza'));
  }, [selectedSubject]);

  // Temas guardados filtrados (agrupados o individuales)
  const filteredCustomGroups = useMemo(() => {
    if (selectedSubject === 'all') return groupedCustomUnits;
    return groupedCustomUnits.filter(g => g.subject === selectedSubject);
  }, [groupedCustomUnits, selectedSubject]);

  const toggleSelectUnit = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playPopSound();
    setSelectedUnitIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  // Jugar o Repasar un grupo completo de temas agrupados
  const handlePlayGroup = async (group: { groupName: string; subject: string; units: UnitSummary[] }) => {
    try {
      sounds.playPopSound();
      const allSets = await Promise.all(group.units.map(u => fetchUnit(u.id)));
      const combinedExercises: ExerciseItem[] = [];
      allSets.forEach(s => combinedExercises.push(...s.exercises));

      // Barajar ejercicios combinados
      const shuffled = [...combinedExercises].sort(() => Math.random() - 0.5);

      const combinedSet: ExerciseSet = {
        title: `Grupo: ${group.groupName}`,
        subject: group.subject,
        summary: `Sesión combinada con ${group.units.length} temas escaneados agrupados.`,
        exercises: shuffled
      };

      onSelectUnit('combined-group', combinedSet);
    } catch (e) {
      console.error('Error al combinar grupo:', e);
    }
  };

  // Iniciar repaso multi-tema con los checkboxes seleccionados
  const handleStartMultiTopicSession = async () => {
    if (selectedUnitIds.size === 0) return;
    sounds.playVictorySound();

    try {
      const combinedExercises: ExerciseItem[] = [];
      let mainSubject = 'Varias Materias';

      for (const id of selectedUnitIds) {
        // Verificar si es del currículo o personalizada
        const currTopic = CURRICULUM_3_PRIMARIA.find(t => t.id === id);
        if (currTopic) {
          mainSubject = currTopic.subject;
          combinedExercises.push(...(currTopic.exercises as any));
        } else {
          const customSet = await fetchUnit(id);
          mainSubject = customSet.subject;
          combinedExercises.push(...customSet.exercises);
        }
      }

      // Barajar ejercicios para que nunca sea estático
      const shuffled = [...combinedExercises].sort(() => Math.random() - 0.5);

      const combinedSet: ExerciseSet = {
        title: `Repaso Combinado (${selectedUnitIds.size} Temas)`,
        subject: mainSubject,
        summary: `Batería variada multi-tema de ${shuffled.length} ejercicios.`,
        exercises: shuffled
      };

      onSelectUnit('multi-topic', combinedSet);
    } catch (e) {
      console.error('Error en multi-topic:', e);
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
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fade-in relative pb-28">
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
        <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-50 px-3.5 py-1 rounded-full border border-magic-200 inline-block shadow-sm">
          BIBLIOTECA Y REPASO MULTI-TEMA
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
          Temario Oficial de 3.º de Primaria y Actividades
        </h2>
        <p className="text-slate-500 font-bold text-sm md:text-base">
          Marca varios temas para estudiar a la vez, o repasa lecciones individuales en tu iPad.
        </p>
      </div>

      {/* SELECTOR DE PESTAÑAS: TEMARIO OFICIAL VS TEMAS GUARDADOS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-3xl border border-slate-200 max-w-md w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`flex-1 sm:flex-none py-3 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
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
            className={`flex-1 sm:flex-none py-3 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              activeTab === 'custom'
                ? 'bg-magic-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Escaneados ({uniqueUnits.length})</span>
          </button>
        </div>

        {/* Toggle para agrupar temas escaneados repetidos */}
        {activeTab === 'custom' && (
          <button
            type="button"
            onClick={() => setGroupByTheme(!groupByTheme)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black border-2 transition-all flex items-center gap-2 ${
              groupByTheme
                ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <span>{groupByTheme ? '📁 Agrupados por temática (Activo)' : '📄 Ver lista individual'}</span>
          </button>
        )}
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
          {filteredCurriculum.map(topic => {
            const isSelected = selectedUnitIds.has(topic.id);

            return (
              <div
                key={topic.id}
                onClick={() => toggleSelectUnit(topic.id)}
                className={`rounded-3xl p-6 shadow-md border-3 transition-all flex flex-col justify-between gap-4 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-magic-50/60 border-magic-500 ring-4 ring-magic-200'
                    : 'bg-white border-magic-100 hover:border-magic-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${SUBJECT_COLORS[topic.subject] || 'bg-slate-100 text-slate-700'}`}>
                      <span>{SUBJECT_ICONS[topic.subject] || '📚'}</span>
                      <span>{topic.subject}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {topic.exercises.length} actividades
                      </span>

                      {/* Checkbox de selección multi-tema */}
                      <button
                        type="button"
                        onClick={(e) => toggleSelectUnit(topic.id, e)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                          isSelected ? 'bg-magic-600 text-white shadow-sm' : 'border-2 border-slate-300 text-transparent hover:border-magic-400'
                        }`}
                      >
                        ✓
                      </button>
                    </div>
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

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
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
            );
          })}
        </div>
      )}

      {/* PESTAÑA 2: TEMAS ESCANEADOS / GUARDADOS (CON AGRUPADOR INTELIGENTE) */}
      {activeTab === 'custom' && (
        <div className="space-y-4 animate-fade-in">
          {groupByTheme ? (
            /* VISTA AGRUPADA (Evita duplicados) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCustomGroups.map(group => {
                const badgeClass = SUBJECT_COLORS[group.subject] || 'bg-slate-100 text-slate-700 border-slate-200';
                const subjectIcon = SUBJECT_ICONS[group.subject] || '📚';

                return (
                  <div
                    key={group.groupName}
                    className="bg-white rounded-3xl p-6 shadow-md border-3 border-indigo-100 hover:border-indigo-300 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${badgeClass}`}>
                          <span>{subjectIcon}</span>
                          <span>{group.subject}</span>
                        </span>

                        <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-3 py-1 rounded-full border border-indigo-200">
                          {group.units.length > 1 ? `📁 ${group.units.length} temas agrupados` : '📄 1 tema'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                          {group.groupName}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          {group.totalExercises} actividades en total combinadas
                        </p>

                        {/* Lista de temas secundarios que componen el grupo */}
                        {group.units.length > 1 && (
                          <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-[11px] font-black uppercase text-slate-400 block">Páginas escaneadas incluidas:</span>
                            {group.units.map(u => (
                              <div key={u.id} className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                <span className="truncate">• {u.title}</span>
                                <span className="text-slate-400 shrink-0 text-[11px]">({u.exercise_count} act.)</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setUnitToDelete(group.units[0])}
                        title="Eliminar tema del grupo"
                        className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePlayGroup(group)}
                        className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-indigo-200 active:scale-95 transition-all"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Estudiar todo el grupo ({group.totalExercises})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VISTA INDIVIDUAL */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueUnits.map(unit => {
                const badgeClass = SUBJECT_COLORS[unit.subject] || 'bg-slate-100 text-slate-700 border-slate-200';
                const subjectIcon = SUBJECT_ICONS[unit.subject] || '📚';
                const isSelected = selectedUnitIds.has(unit.id);

                return (
                  <div
                    key={unit.id}
                    onClick={() => toggleSelectUnit(unit.id)}
                    className={`rounded-3xl p-6 shadow-md border-3 transition-all flex flex-col justify-between gap-4 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-magic-50/60 border-magic-500 ring-4 ring-magic-200'
                        : 'bg-white border-magic-100 hover:border-magic-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${badgeClass}`}>
                          <span>{subjectIcon}</span>
                          <span>{unit.subject}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">
                            {unit.exercise_count} act.
                          </span>

                          <button
                            type="button"
                            onClick={(e) => toggleSelectUnit(unit.id, e)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                              isSelected ? 'bg-magic-600 text-white shadow-sm' : 'border-2 border-slate-300 text-transparent hover:border-magic-400'
                            }`}
                          >
                            ✓
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-800 leading-snug line-clamp-2">
                          {unit.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
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
                        <span>Jugar tema</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BARRA FLOTANTE MULTI-TEMA: Aparece cuando hay al menos 1 tema seleccionado */}
      {selectedUnitIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl border-2 border-magic-400 shadow-2xl flex flex-col sm:flex-row items-center gap-4 animate-slide-in max-w-xl w-[92%]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-magic-600 flex items-center justify-center font-black text-lg shadow-md shrink-0">
              {selectedUnitIds.size}
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black leading-tight text-white">
                {selectedUnitIds.size === 1 ? '1 tema seleccionado' : `${selectedUnitIds.size} temas combinados`}
              </h4>
              <p className="text-[11px] font-semibold text-slate-400">
                Se mezclarán todas sus preguntas de forma aleatoria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedUnitIds(new Set())}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Desmarcar
            </button>

            <button
              type="button"
              onClick={handleStartMultiTopicSession}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-magic-600 to-indigo-600 hover:from-magic-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-magic-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Repaso Combinado</span>
            </button>
          </div>
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
