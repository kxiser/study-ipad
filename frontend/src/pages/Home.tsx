import React, { useEffect, useState } from 'react';
import { Camera, Sparkles, BookOpen, Star, RefreshCw, Trophy } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-fade-in">
      {/* Saludo con la Mascota */}
      <div className="bg-gradient-to-r from-magic-100 via-white to-sunny-100 rounded-4xl p-6 md:p-8 border-3 border-magic-200 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-block bg-magic-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
            ¡Hola, {profile?.name || 'Campeona'}!
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
            ¿Qué libro exploramos hoy?
          </h2>
          <p className="text-slate-600 font-bold text-base md:text-lg">
            Haz una foto de tu libro del cole y jugaremos con sus actividades mágicas.
          </p>
        </div>

        <div className="shrink-0">
          <Mascot
            mascotType={profile?.mascot || 'chispa'}
            mood="happy"
            size="lg"
            message="¡Estoy listo para aprender contigo!"
          />
        </div>
      </div>

      {/* Botones de Acción Gigantes Táctiles para iPad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Escanear Libro */}
        <button
          type="button"
          onClick={() => onNavigate('scan')}
          className="group relative bg-gradient-to-br from-magic-500 to-indigo-600 hover:from-magic-600 hover:to-indigo-700 text-white p-7 rounded-4xl shadow-xl shadow-magic-300 border-4 border-magic-400 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
            <Camera className="w-9 h-9" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-sunny-300">Nuevo Tema</span>
              <Sparkles className="w-4 h-4 text-sunny-300" />
            </div>
            <h3 className="text-2xl font-black leading-tight">Escanear Libro</h3>
            <p className="text-magic-100 text-xs md:text-sm font-semibold mt-1">
              Foto a la página y la IA creará tus juegos
            </p>
          </div>
        </button>

        {/* 2. Repaso de Hoy (SRS) */}
        <button
          type="button"
          onClick={() => onNavigate('review')}
          className="group relative bg-gradient-to-br from-amber-400 to-sunny-500 hover:from-amber-500 hover:to-sunny-600 text-amber-950 p-7 rounded-4xl shadow-xl shadow-amber-200 border-4 border-amber-300 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-amber-950 shadow-inner group-hover:scale-110 transition-transform">
              <RefreshCw className="w-9 h-9" />
            </div>
            {reviewCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md animate-pulse">
                {reviewCount} pendientes
              </span>
            )}
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-1">
              Memoria Espaciada
            </span>
            <h3 className="text-2xl font-black leading-tight">Repaso de Hoy</h3>
            <p className="text-amber-900 text-xs md:text-sm font-semibold mt-1">
              {reviewCount > 0
                ? `${reviewCount} preguntas para recordar y ganar estrellas`
                : '¡Todo al día! Practica cuando quieras'}
            </p>
          </div>
        </button>

        {/* 3. Mis Temas Guardados */}
        <button
          type="button"
          onClick={() => onNavigate('units')}
          className="group relative bg-gradient-to-br from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-emerald-950 p-7 rounded-4xl shadow-xl shadow-emerald-200 border-4 border-emerald-300 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-emerald-950 shadow-inner group-hover:scale-110 transition-transform">
            <BookOpen className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block mb-1">
              Biblioteca
            </span>
            <h3 className="text-2xl font-black leading-tight">Mis Temas</h3>
            <p className="text-emerald-900 text-xs md:text-sm font-semibold mt-1">
              Vuelve a jugar cualquiera de tus lecciones guardadas
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
            Estudiar 5 o 10 minutos cada día hace que tu cerebro se vuelva súper fuerte.
          </p>
        </div>
      </div>
    </div>
  );
};
