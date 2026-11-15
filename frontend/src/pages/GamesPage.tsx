import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Trophy, Gamepad2, ArrowLeft, BookOpen, Check, Layers, Filter } from 'lucide-react';
import { UserProfile, ExerciseItem, UnitSummary } from '../types.js';
import { fetchUnits, fetchUnit } from '../services/api.js';
import { MemoryGame } from '../components/games/MemoryGame.js';
import { BubbleGame } from '../components/games/BubbleGame.js';
import { WheelGame } from '../components/games/WheelGame.js';
import { TreasureMapGame } from '../components/games/TreasureMapGame.js';
import { ClosetShop } from '../components/games/ClosetShop.js';
import { Mascot } from '../components/Mascot.js';

interface GamesPageProps {
  profile: UserProfile | null;
  onBack: () => void;
  onStarsUpdated?: (newStars: number) => void;
}

type ActiveGameMode = 'hub' | 'memory' | 'bubble' | 'wheel' | 'treasure' | 'closet';

type TaggedExerciseItem = ExerciseItem & {
  unitId?: string;
  unitTitle?: string;
  unitSubject?: string;
};

export const GamesPage: React.FC<GamesPageProps> = ({
  profile,
  onBack,
  onStarsUpdated
}) => {
  const [activeMode, setActiveMode] = useState<ActiveGameMode>('hub');
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(['all']);
  const [exercisesPool, setExercisesPool] = useState<TaggedExerciseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userStars, setUserStars] = useState(profile?.stars || 30);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.stars !== undefined) {
      setUserStars(profile.stars);
    }
  }, [profile?.stars]);

  // Cargar todas las unidades y ejercicios de Samantha (sin límite de 8, todos los que tenga)
  useEffect(() => {
    async function loadAllExercises() {
      setIsLoading(true);
      try {
        const uList = await fetchUnits();
        setUnits(uList);

        const allExercises: TaggedExerciseItem[] = [];
        for (const u of uList) {
          try {
            const data = await fetchUnit(u.id);
            if (data?.exercises) {
              const sanitized: TaggedExerciseItem[] = data.exercises.map(ex => {
                let updated = { ...ex, unitId: u.id, unitTitle: u.title, unitSubject: u.subject };
                // Auto-corrección semántica si la explicación contradice una respuesta incorrecta
                if (updated.type === 'multiple_choice' && updated.options && updated.explanation) {
                  const exp = updated.explanation.toLowerCase();
                  for (const opt of updated.options) {
                    if (opt.length >= 4 && exp.includes(opt.toLowerCase()) && !exp.includes('casi') && !exp.includes('en realidad no')) {
                      updated.correctAnswer = opt;
                      break;
                    }
                  }
                }
                return updated;
              });
              allExercises.push(...sanitized);
            }
          } catch {}
        }
        setExercisesPool(allExercises);
      } catch (e) {
        console.warn('Error cargando ejercicios para juegos:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllExercises();
  }, []);

  // Filtrar ejercicios según los temas seleccionados por Samantha
  const filteredExercises = exercisesPool.filter(ex => {
    if (selectedUnitIds.includes('all')) return true;
    return ex.unitId && selectedUnitIds.includes(ex.unitId);
  });

  const handleStarsEarned = (stars: number) => {
    const updated = userStars + stars;
    setUserStars(updated);
    if (onStarsUpdated) onStarsUpdated(updated);
  };

  const handleStarsSpent = (updated: number) => {
    setUserStars(updated);
    if (onStarsUpdated) onStarsUpdated(updated);
  };

  const toggleUnitSelection = (unitId: string) => {
    if (unitId === 'all') {
      setSelectedUnitIds(['all']);
      return;
    }

    let next = selectedUnitIds.filter(id => id !== 'all');
    if (next.includes(unitId)) {
      next = next.filter(id => id !== unitId);
      if (next.length === 0) next = ['all'];
    } else {
      next.push(unitId);
    }
    setSelectedUnitIds(next);
  };

  const getSelectionLabel = () => {
    if (selectedUnitIds.includes('all') || selectedUnitIds.length === 0) {
      return 'Todos los temas (Mix Mágico)';
    }
    if (selectedUnitIds.length === 1) {
      const u = units.find(item => item.id === selectedUnitIds[0]);
      return u ? u.title : '1 tema seleccionado';
    }
    return `${selectedUnitIds.length} temas seleccionados`;
  };

  // Render de juegos activos
  if (activeMode === 'memory') {
    return (
      <MemoryGame
        exercises={filteredExercises}
        title={`🃏 Memory: ${getSelectionLabel()}`}
        onBack={() => setActiveMode('hub')}
        onStarsEarned={handleStarsEarned}
      />
    );
  }

  if (activeMode === 'bubble') {
    return (
      <BubbleGame
        exercises={filteredExercises}
        title={`🫧 Burbujas: ${getSelectionLabel()}`}
        onBack={() => setActiveMode('hub')}
        onStarsEarned={handleStarsEarned}
      />
    );
  }

  if (activeMode === 'wheel') {
    return (
      <WheelGame
        exercises={filteredExercises}
        onBack={() => setActiveMode('hub')}
        onStarsEarned={handleStarsEarned}
      />
    );
  }

  if (activeMode === 'treasure') {
    return (
      <TreasureMapGame
        exercises={filteredExercises}
        onBack={() => setActiveMode('hub')}
        onStarsEarned={handleStarsEarned}
      />
    );
  }

  if (activeMode === 'closet') {
    return (
      <ClosetShop
        userStars={userStars}
        onBack={() => setActiveMode('hub')}
        onStarsUpdated={handleStarsSpent}
      />
    );
  }

  // ==========================================
  // HUB PRINCIPAL DE JUEGOS
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-fade-in">
      {/* Cabecera con Chispa y Bienvenida */}
      <div className="bg-gradient-to-r from-sunny-100 via-pink-50 to-magic-100 rounded-4xl p-6 md:p-8 border-3 border-magic-200 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="inline-block bg-magic-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
              🎮 Zona Arcade de Estudio
            </span>
            <div className="flex items-center gap-1.5 bg-sunny-100 border border-sunny-300 px-3 py-1 rounded-full text-amber-900 font-extrabold text-xs shadow-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-bounce" />
              <span>{userStars} Estrellas</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
            ¡Aprende Jugando!
          </h2>
          <p className="text-slate-600 font-bold text-base md:text-lg max-w-xl">
            Cada vez que escaneas un tema nuevo, se añade a los juegos. Puedes jugar con todos a la vez o elegir los que quieras practicar hoy.
          </p>
        </div>

        <div className="shrink-0">
          <Mascot
            mascotType={profile?.mascot || 'chispa'}
            mood="happy"
            size="lg"
            message="¿Qué tema jugamos hoy?"
          />
        </div>
      </div>

      {/* SELECTOR DE TEMAS TÁCTIL PARA IPAD */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border-3 border-magic-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-magic-100 text-magic-600 flex items-center justify-center shrink-0">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Temas activos en los juegos:
            </span>
            <h4 className="font-black text-slate-800 text-base md:text-lg">
              {getSelectionLabel()}
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              ({filteredExercises.length} preguntas disponibles de {units.length} temas escaneados)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedUnitIds(['all'])}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm active:scale-95 transition-all ${
              selectedUnitIds.includes('all')
                ? 'bg-magic-600 text-white shadow-md shadow-magic-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            🌟 Todos los temas
          </button>

          <button
            onClick={() => setIsTopicModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sunny-100 hover:bg-sunny-200 border border-sunny-300 text-amber-950 font-black text-xs md:text-sm active:scale-95 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Elegir Temas</span>
          </button>
        </div>
      </div>

      {/* Cuadrícula de Juegos Mágicos Interactivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Memory Mágico */}
        <button
          onClick={() => setActiveMode('memory')}
          className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-7 rounded-4xl shadow-xl shadow-indigo-200 border-4 border-indigo-400 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl shadow-inner group-hover:scale-110 transition-transform">
            🃏
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-purple-200 block mb-1">
              Cartas 3D
            </span>
            <h3 className="text-2xl font-black leading-tight">Memory Mágico</h3>
            <p className="text-indigo-100 text-xs md:text-sm font-semibold mt-1">
              Voltea las cartas y une las preguntas con sus respuestas.
            </p>
          </div>
        </button>

        {/* 2. Atrapa la Burbuja */}
        <button
          onClick={() => setActiveMode('bubble')}
          className="group relative bg-gradient-to-br from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white p-7 rounded-4xl shadow-xl shadow-sky-200 border-4 border-sky-300 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl shadow-inner group-hover:scale-110 transition-transform">
            🫧
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-sky-200 block mb-1">
              Reflejos Táctiles
            </span>
            <h3 className="text-2xl font-black leading-tight">Atrapa la Burbuja</h3>
            <p className="text-sky-100 text-xs md:text-sm font-semibold mt-1">
              Pincha en la pantalla la burbuja que tiene la respuesta correcta.
            </p>
          </div>
        </button>

        {/* 3. La Ruleta Mágica */}
        <button
          onClick={() => setActiveMode('wheel')}
          className="group relative bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-amber-950 p-7 rounded-4xl shadow-xl shadow-amber-200 border-4 border-amber-300 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-amber-950 text-3xl shadow-inner group-hover:scale-110 transition-transform">
            🎡
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-1">
              Suerte y Retos
            </span>
            <h3 className="text-2xl font-black leading-tight text-white drop-shadow-sm">Ruleta de Chispa</h3>
            <p className="text-amber-100 text-xs md:text-sm font-semibold mt-1">
              Gira la ruleta mágica y supera preguntas para multiplicar estrellas.
            </p>
          </div>
        </button>

        {/* 4. El Mapa del Tesoro */}
        <button
          onClick={() => setActiveMode('treasure')}
          className="group relative bg-gradient-to-br from-emerald-400 to-teal-600 hover:from-emerald-500 hover:to-teal-700 text-white p-7 rounded-4xl shadow-xl shadow-emerald-200 border-4 border-emerald-300 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl shadow-inner group-hover:scale-110 transition-transform">
            🗺️
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200 block mb-1">
              Modo Aventura
            </span>
            <h3 className="text-2xl font-black leading-tight">Mapa del Tesoro</h3>
            <p className="text-emerald-100 text-xs md:text-sm font-semibold mt-1">
              Recorre el camino con Chispa hasta el castillo y abre el gran cofre.
            </p>
          </div>
        </button>

        {/* 5. El Armario de Chispa */}
        <button
          onClick={() => setActiveMode('closet')}
          className="group relative bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white p-7 rounded-4xl shadow-xl shadow-pink-200 border-4 border-pink-300 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl shadow-inner group-hover:scale-110 transition-transform">
            🎩
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-pink-200 block mb-1">
              Tienda de Premios
            </span>
            <h3 className="text-2xl font-black leading-tight">Armario de Chispa</h3>
            <p className="text-pink-100 text-xs md:text-sm font-semibold mt-1">
              Gasta tus estrellas para ponerle sombreros, gafas y capas a Chispa.
            </p>
          </div>
        </button>
      </div>

      {/* MODAL DE SELECCIÓN DE TEMAS */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl p-6 md:p-8 max-w-lg w-full border-4 border-magic-400 shadow-2xl space-y-5 animate-scale-up max-h-[85vh] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-50 px-3 py-1 rounded-full border border-magic-200 inline-block">
                Configurar Juegos
              </span>
              <h3 className="text-2xl font-black text-slate-800">
                ¿De qué temas quieres jugar?
              </h3>
              <p className="text-xs md:text-sm font-semibold text-slate-500">
                Puedes marcar uno solo para repasar ese examen, o marcar varios a la vez.
              </p>
            </div>

            {/* Lista scrollable de temas de Samantha */}
            <div className="overflow-y-auto space-y-2 pr-1 my-2 flex-1 max-h-[50vh]">
              {/* Opción Todos */}
              <div
                onClick={() => setSelectedUnitIds(['all'])}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  selectedUnitIds.includes('all')
                    ? 'bg-magic-50 border-magic-500 text-magic-900 font-black shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    selectedUnitIds.includes('all') ? 'bg-magic-600 text-white' : 'border-2 border-slate-300'
                  }`}>
                    {selectedUnitIds.includes('all') && <Check className="w-4 h-4" />}
                  </div>
                  <span>🌟 Todos los temas juntos (Modo Mix)</span>
                </div>
              </div>

              {/* Lista de temas de Samantha */}
              {units.map(u => {
                const isSelected = selectedUnitIds.includes(u.id);

                return (
                  <div
                    key={u.id}
                    onClick={() => toggleUnitSelection(u.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-magic-50 border-magic-500 text-magic-900 font-black shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-magic-600 text-white' : 'border-2 border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-magic-600 block truncate">
                          {u.subject}
                        </span>
                        <h4 className="text-sm font-black truncate leading-tight">
                          {u.title}
                        </h4>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-bold shrink-0">
                      {u.exercise_count || 6} ej.
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Botón cerrar modal */}
            <button
              onClick={() => setIsTopicModalOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-base shadow-md shadow-magic-300 active:scale-95 transition-all"
            >
              ¡Guardar selección y Jugar! ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
