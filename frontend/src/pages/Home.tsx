import React, { useEffect, useState } from 'react';
import { Camera, Sparkles, BookOpen, Star, RefreshCw, Trophy, Gamepad2, GraduationCap, Compass } from 'lucide-react';
import { Mascot } from '../components/Mascot.js';
import { UserProfile } from '../types.js';
import { fetchReviewCount } from '../services/api.js';

interface HomeProps {
  profile: UserProfile | null;
  onNavigate: (page: string, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ profile, onNavigate }) => {
  const [reviewCount, setReviewCount] = useState<number>(0);

  useEffect(() => {
    fetchReviewCount().then(setReviewCount);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-fade-in">
      {/* Saludo con la Mascota */}
      <div className="bg-gradient-to-r from-magic-100 via-white to-sunny-100 rounded-4xl p-6 md:p-8 border-3 border-magic-200 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-block bg-magic-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
            ¡Hola, {profile?.name || 'Samantha'}!
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
            ¿Qué jugamos y exploramos hoy?
          </h2>
          <p className="text-slate-600 font-bold text-base md:text-lg">
            Aprende con tus libros del cole, juega en el arcade o disfraza a Chispa.
          </p>
        </div>

        <div className="shrink-0">
          <Mascot
            mascotType={profile?.mascot || 'chispa'}
            mood="happy"
            size="lg"
            message="¡Estoy listo para jugar contigo!"
          />
        </div>
      </div>

      {/* Botones de Acción Gigantes Táctiles para iPad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Escanear Libro */}
        <button
          type="button"
          onClick={() => onNavigate('scan')}
          className="group relative bg-gradient-to-br from-magic-500 to-indigo-600 hover:from-magic-600 hover:to-indigo-700 text-white p-6 rounded-4xl shadow-xl shadow-magic-300 border-4 border-magic-400 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-sunny-300">Nuevo Tema</span>
              <Sparkles className="w-3.5 h-3.5 text-sunny-300" />
            </div>
            <h3 className="text-xl font-black leading-tight">Escanear Libro</h3>
            <p className="text-magic-100 text-xs font-semibold mt-1">
              Foto a la página y la IA creará tus ejercicios
            </p>
          </div>
        </button>

        {/* 2. Repaso de Hoy (SRS) */}
        <button
          type="button"
          onClick={() => onNavigate('review')}
          className="group relative bg-gradient-to-br from-amber-400 to-sunny-500 hover:from-amber-500 hover:to-sunny-600 text-amber-950 p-6 rounded-4xl shadow-xl shadow-amber-200 border-4 border-amber-300 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-amber-950 shadow-inner group-hover:scale-110 transition-transform">
              <RefreshCw className="w-8 h-8" />
            </div>
            {reviewCount > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
                {reviewCount}
              </span>
            )}
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block mb-1">
              Memoria
            </span>
            <h3 className="text-xl font-black leading-tight">Repaso de Hoy</h3>
            <p className="text-amber-900 text-xs font-semibold mt-1">
              {reviewCount > 0
                ? `${reviewCount} preguntas para recordar y ganar estrellas`
                : '¡Todo al día! Practica cuando quieras'}
            </p>
          </div>
        </button>

        {/* 3. Sala de Juegos Mágicos */}
        <button
          type="button"
          onClick={() => onNavigate('games')}
          className="group relative bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white p-6 rounded-4xl shadow-xl shadow-pink-200 border-4 border-pink-400 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-sunny-200">Arcade</span>
              <Sparkles className="w-3.5 h-3.5 text-sunny-200" />
            </div>
            <h3 className="text-xl font-black leading-tight">Juegos Mágicos</h3>
            <p className="text-pink-100 text-xs font-semibold mt-1">
              Memory, Burbujas, Ruleta, Tesoro y Armario de Chispa
            </p>
          </div>
        </button>

        {/* 4. Mis Temas Guardados */}
        <button
          type="button"
          onClick={() => onNavigate('units')}
          className="group relative bg-gradient-to-br from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-emerald-950 p-6 rounded-4xl shadow-xl shadow-emerald-200 border-4 border-emerald-300 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-emerald-950 shadow-inner group-hover:scale-110 transition-transform">
            <BookOpen className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block mb-1">
              Biblioteca
            </span>
            <h3 className="text-xl font-black leading-tight">Mis Temas</h3>
            <p className="text-emerald-900 text-xs font-semibold mt-1">
              Vuelve a repasar cualquiera de tus lecciones
            </p>
          </div>
        </button>

        {/* 5. Simulador de Exámenes Reales */}
        <button
          type="button"
          onClick={() => onNavigate('exam')}
          className="group relative bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 hover:from-indigo-800 hover:to-purple-800 text-white p-6 rounded-4xl shadow-xl shadow-indigo-300 border-4 border-indigo-400 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px] sm:col-span-1 lg:col-span-2"
        >
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
              <GraduationCap className="w-8 h-8 text-amber-300" />
            </div>
            <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
              Pureza de María • Madrid
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">Evaluación Oficial</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <h3 className="text-xl md:text-2xl font-black leading-tight">Simulador de Examen Real</h3>
            <p className="text-indigo-100 text-xs font-semibold mt-1">
              Exámenes de 3.º Primaria con nota sobre 10, temporizador y boletín PDF.
            </p>
          </div>
        </button>

        {/* 6. Enciclopedia Infantil (Vikidia) & Búsqueda por Edad */}
        <button
          type="button"
          onClick={() => onNavigate('encyclopedia')}
          className="group relative bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700 hover:from-teal-600 hover:to-cyan-700 text-white p-6 rounded-4xl shadow-xl shadow-cyan-200 border-4 border-cyan-400 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px] sm:col-span-1 lg:col-span-2"
        >
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
              <Compass className="w-8 h-8 text-teal-200" />
            </div>
            <span className="bg-teal-300 text-teal-950 text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
              Vikidia • Temas por Edad
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-200">Aprender y Descubrir</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            </div>
            <h3 className="text-xl md:text-2xl font-black leading-tight">Enciclopedia Infantil</h3>
            <p className="text-teal-100 text-xs font-semibold mt-1">
              Busca volcanes, dinosaurios o planetas por edad y crea lecciones interactivas.
            </p>
          </div>
        </button>
      </div>

      {/* Frase motivadora / Tips */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sunny-100 text-amber-600 flex items-center justify-center shrink-0">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-black text-slate-800 text-sm md:text-base">
            ¡Tu racha mágica es de {profile?.currentStreak ?? 1} {profile?.currentStreak === 1 ? 'día' : 'días'}!
          </h4>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Estudiar y jugar 5 o 10 minutos cada día hace que tu cerebro se vuelva súper fuerte.
          </p>
        </div>
      </div>
    </div>
  );
};
