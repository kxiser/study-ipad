import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Trophy, Gamepad2, ArrowLeft, BookOpen } from 'lucide-react';
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

export const GamesPage: React.FC<GamesPageProps> = ({
  profile,
  onBack,
  onStarsUpdated
}) => {
  const [activeMode, setActiveMode] = useState<ActiveGameMode>('hub');
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [exercisesPool, setExercisesPool] = useState<ExerciseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userStars, setUserStars] = useState(profile?.stars || 30);

  useEffect(() => {
    if (profile?.stars !== undefined) {
      setUserStars(profile.stars);
    }
  }, [profile?.stars]);

  // Cargar todas las unidades y ejercicios de Samantha
  useEffect(() => {
    async function loadAllExercises() {
      setIsLoading(true);
      try {
        const uList = await fetchUnits();
        setUnits(uList);

        // Cargar ejercicios de las primeras unidades
        const allExercises: ExerciseItem[] = [];
        const unitsToLoad = uList.slice(0, 8); // cargar hasta 8 unidades
        for (const u of unitsToLoad) {
          try {
            const data = await fetchUnit(u.id);
            if (data?.exercises) {
              const sanitized = data.exercises.map(ex => {
                // Auto-corrección semántica si la explicación contradice una respuesta incorrecta
                if (ex.type === 'multiple_choice' && ex.options && ex.explanation) {
                  const exp = ex.explanation.toLowerCase();
                  for (const opt of ex.options) {
                    if (opt.length >= 4 && exp.includes(opt.toLowerCase()) && !exp.includes('casi') && !exp.includes('en realidad no')) {
                      return { ...ex, correctAnswer: opt };
                    }
                  }
                }
                return ex;
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

  // Filtrar ejercicios por asignatura seleccionada
  const filteredExercises = exercisesPool.filter(ex => {
    if (selectedSubject === 'all') return true;
    // Si la unidad tiene subject coincidente
    return true;
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

  // Render de juegos activos
  if (activeMode === 'memory') {
    return (
      <MemoryGame
        exercises={filteredExercises}
        title="🃏 Memory Mágico de Samantha"
        onBack={() => setActiveMode('hub')}
        onStarsEarned={handleStarsEarned}
      />
    );
  }

  if (activeMode === 'bubble') {
    return (
      <BubbleGame
        exercises={filteredExercises}
        title="🫧 Atrapa la Burbuja"
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

  // HUB PRINCIPAL DE JUEGOS
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
            Todos los juegos usan las preguntas de tus libros escaneados. ¡Gana estrellas y disfraza a Chispa!
          </p>
        </div>

        <div className="shrink-0">
          <Mascot
            mascotType={profile?.mascot || 'chispa'}
            mood="happy"
            size="lg"
            message="¡Elige un juego para empezar!"
          />
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
    </div>
  );
};
