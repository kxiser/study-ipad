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
  FolderOpen,
  ChevronDown,
  FolderCheck
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
  'Natural Science': 'bg-teal-100 text-teal-800 border-teal-300',
  'Natural Science (Inglés)': 'bg-teal-100 text-teal-800 border-teal-300',
  'Social Science': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Social Science (Inglés)': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Ciencias de la Naturaleza': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Ciencias Naturales': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Matemáticas': 'bg-blue-100 text-blue-800 border-blue-300',
  'Lengua Castellana': 'bg-rose-100 text-rose-800 border-rose-300',
  'Ciencias Sociales': 'bg-amber-100 text-amber-800 border-amber-300',
  'Inglés': 'bg-purple-100 text-purple-800 border-purple-300',
  'English': 'bg-purple-100 text-purple-800 border-purple-300',
};

const SUBJECT_ICONS: Record<string, string> = {
  'Natural Science': '🔬',
  'Natural Science (Inglés)': '🔬',
  'Social Science': '🌐',
  'Social Science (Inglés)': '🌐',
  'Ciencias de la Naturaleza': '🌿',
  'Ciencias Naturales': '🌿',
  'Matemáticas': '🔢',
  'Lengua Castellana': '📖',
  'Ciencias Sociales': '🌍',
  'Inglés': '🇬🇧',
  'English': '🇬🇧',
};

// Extrae dinámicamente el tema conceptual eliminando palabras vacías y prefijos
function extractClusterTheme(title: string): string {
  const cleaned = title
    .replace(/[¡!¿?]/g, '')
    .replace(/\b(tema|unidad|lección|leccion|bloque|página|pagina|pág|pag)\s*\d+[:.-]?/gi, '')
    .replace(/\b(el|la|los|las|de|del|en|y|o|nuestro|nuestra|un|una|mundo|exploramos|exploradores|aventura)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || cleaned.length < 3) return title.trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Algoritmo procedural de clustering para agrupar páginas escaneadas del mismo tema sin hardcoding
interface UnitGroup {
  groupName: string;
  subject: string;
  units: UnitSummary[];
  totalExercises: number;
}

function clusterUnits(unitsList: UnitSummary[]): UnitGroup[] {
  const groups: UnitGroup[] = [];

  for (const unit of unitsList) {
    const rawTheme = extractClusterTheme(unit.title);
    const unitWords = rawTheme.toLowerCase().split(/\s+/).filter(w => w.length >= 4);

    // Buscar si ya existe un grupo de la misma materia que comparta palabras clave
    const matchedGroup = groups.find(g => {
      if (g.subject !== unit.subject) return false;
      const groupWords = extractClusterTheme(g.groupName).toLowerCase().split(/\s+/).filter(w => w.length >= 4);
      return (
        unitWords.some(uw => groupWords.includes(uw)) ||
        rawTheme.toLowerCase().includes(g.groupName.toLowerCase()) ||
        g.groupName.toLowerCase().includes(rawTheme.toLowerCase())
      );
    });

    if (matchedGroup) {
      matchedGroup.units.push(unit);
      matchedGroup.totalExercises += (unit.exercise_count || 5);
      // Mantener el nombre más conciso y claro
      if (rawTheme.length >= 4 && rawTheme.length < matchedGroup.groupName.length) {
        matchedGroup.groupName = rawTheme;
      }
    } else {
      groups.push({
        groupName: rawTheme || unit.title,
        subject: unit.subject,
        units: [unit],
        totalExercises: unit.exercise_count || 5
      });
    }
  }

  return groups;
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
  // Carpetas desplegadas/expandidas de forma intuitiva
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());

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

  // Agrupar temas escaneados similares por núcleo semántico dinámico
  const groupedCustomUnits = useMemo(() => {
    return clusterUnits(uniqueUnits);
  }, [uniqueUnits]);

  // Temas del currículo oficial filtrados
  const filteredCurriculum = useMemo(() => {
    if (selectedSubject === 'all') return CURRICULUM_3_PRIMARIA;
    return CURRICULUM_3_PRIMARIA.filter(t => {
      const sub = t.subject as string;
      if (selectedSubject === 'Ciencias Naturales' || selectedSubject === 'Ciencias de la Naturaleza') {
        return sub === 'Ciencias de la Naturaleza' || sub === 'Ciencias Naturales';
      }
      if (selectedSubject === 'Natural Science') {
        return sub === 'Natural Science' || t.title.toLowerCase().includes('science');
      }
      if (selectedSubject === 'Inglés') {
        return sub === 'Inglés' || sub === 'English';
      }
      return sub === selectedSubject;
    });
  }, [selectedSubject]);

  // Temas guardados filtrados (agrupados o individuales)
  const filteredCustomGroups = useMemo(() => {
    if (selectedSubject === 'all') return groupedCustomUnits;
    return groupedCustomUnits.filter(g => {
      if (selectedSubject === 'Ciencias Naturales' || selectedSubject === 'Ciencias de la Naturaleza') {
        return g.subject === 'Ciencias de la Naturaleza' || g.subject === 'Ciencias Naturales';
      }
      if (selectedSubject === 'Natural Science') {
        return g.subject === 'Natural Science' || g.subject.toLowerCase().includes('science');
      }
      if (selectedSubject === 'Inglés') {
        return g.subject === 'Inglés' || g.subject === 'English';
      }
      return g.subject === selectedSubject;
    });
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

  const toggleGroupExpand = (groupName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playPopSound();
    setExpandedGroupKeys(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const isGroupSelected = (group: UnitGroup) => {
    return group.units.length > 0 && group.units.every(u => selectedUnitIds.has(u.id));
  };

  const isGroupPartiallySelected = (group: UnitGroup) => {
    const count = group.units.filter(u => selectedUnitIds.has(u.id)).length;
    return count > 0 && count < group.units.length;
  };

  const toggleSelectGroup = (group: UnitGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playPopSound();
    const allSelected = isGroupSelected(group);
    setSelectedUnitIds(prev => {
      const next = new Set(prev);
      group.units.forEach(u => {
        if (allSelected) {
          next.delete(u.id);
        } else {
          next.add(u.id);
        }
      });
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

        {/* Selector de Vista: Carpetas Inteligentes vs Lista Individual */}
        {activeTab === 'custom' && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => {
                sounds.playPopSound();
                setGroupByTheme(true);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                groupByTheme
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>📁 Carpetas Inteligentes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playPopSound();
                setGroupByTheme(false);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                !groupByTheme
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>📄 Páginas Sueltas</span>
            </button>
          </div>
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

        {['Lengua Castellana', 'Matemáticas', 'Ciencias de la Naturaleza', 'Ciencias Sociales', 'Natural Science', 'Inglés'].map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all border-2 active:scale-95 flex items-center gap-2 cursor-pointer ${
              selectedSubject === sub
                ? 'bg-magic-600 text-white border-magic-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-magic-300'
            }`}
          >
            <span>{SUBJECT_ICONS[sub] || '📚'}</span>
            <span>{sub === 'Natural Science' ? '🔬 Natural Science (Inglés)' : sub}</span>
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
            /* VISTA AGRUPADA INTUITIVA (Carpetas Conceptuales) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCustomGroups.map(group => {
                const badgeClass = SUBJECT_COLORS[group.subject] || 'bg-slate-100 text-slate-700 border-slate-200';
                const subjectIcon = SUBJECT_ICONS[group.subject] || '📚';
                const isExpanded = expandedGroupKeys.has(group.groupName);
                const isSelected = isGroupSelected(group);
                const isPartial = isGroupPartiallySelected(group);

                return (
                  <div
                    key={group.groupName}
                    className={`bg-white rounded-3xl p-6 shadow-md border-3 transition-all flex flex-col justify-between gap-4 ${
                      isSelected
                        ? 'border-indigo-500 ring-4 ring-indigo-100 bg-indigo-50/30'
                        : 'border-indigo-100 hover:border-indigo-300'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Cabecera de la Carpeta */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${badgeClass}`}>
                          <span>{subjectIcon}</span>
                          <span>{group.subject}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-3 py-1 rounded-full border border-indigo-200">
                            {group.units.length > 1 ? `📁 ${group.units.length} páginas combinadas` : '📄 1 página'}
                          </span>

                          {/* Checkbox para seleccionar todo el grupo en repaso multi-tema */}
                          <button
                            type="button"
                            onClick={(e) => toggleSelectGroup(group, e)}
                            title="Seleccionar todo el grupo para repaso multi-tema"
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-magic-600 text-white shadow-sm'
                                : isPartial
                                ? 'bg-magic-200 text-magic-800'
                                : 'border-2 border-slate-300 text-transparent hover:border-magic-400'
                            }`}
                          >
                            ✓
                          </button>
                        </div>
                      </div>

                      {/* Título de la Carpeta */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                          {group.groupName}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                          {group.totalExercises} actividades en total {group.units.length > 1 ? `(${group.units.length} páginas escaneadas)` : ''}
                        </p>
                      </div>

                      {/* Acordeón / Desplegable intuitivo de páginas incluidas */}
                      {group.units.length > 1 && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={(e) => toggleGroupExpand(group.groupName, e)}
                            className="w-full py-2.5 px-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-extrabold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer border border-indigo-200"
                          >
                            <span className="flex items-center gap-2">
                              <FolderOpen className="w-4 h-4 text-indigo-600" />
                              <span>{isExpanded ? 'Ocultar páginas escaneadas' : `Ver las ${group.units.length} páginas escaneadas`}</span>
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Lista desplegada con acciones individuales por página */}
                          {isExpanded && (
                            <div className="mt-2.5 space-y-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 animate-fade-in">
                              {group.units.map(u => (
                                <div
                                  key={u.id}
                                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                                      {u.title}
                                    </p>
                                    <span className="text-[11px] font-bold text-slate-400">
                                      {u.exercise_count} actividades
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setUnitToDelete(u)}
                                      title="Eliminar esta página escaneada"
                                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePlayCustom(u.id)}
                                      className="px-3 py-1.5 rounded-xl bg-magic-600 hover:bg-magic-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                                    >
                                      <Play className="w-3 h-3 fill-white" />
                                      <span>Jugar</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Acciones del pie de la Carpeta */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      {group.units.length === 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setUnitToDelete(group.units[0])}
                            title="Eliminar este tema"
                            className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePlayCustom(group.units[0].id)}
                            className="px-5 py-2.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-magic-200 active:scale-95 transition-all cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Jugar tema ({group.totalExercises} act.)</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-black text-indigo-700 flex items-center gap-1">
                            <FolderCheck className="w-4 h-4 text-indigo-600" />
                            <span>Carpeta Inteligente</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handlePlayGroup(group)}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-magic-600 hover:from-indigo-700 hover:to-magic-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-indigo-200 active:scale-95 transition-all cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Estudiar todo el grupo ({group.totalExercises})</span>
                          </button>
                        </>
                      )}
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
