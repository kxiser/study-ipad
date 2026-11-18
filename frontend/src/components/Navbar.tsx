import React, { useState, useEffect } from 'react';
import { Star, Flame, Wifi, WifiOff, Settings, Home, BookOpen, Gamepad2, GraduationCap, Compass, Printer, Sparkles } from 'lucide-react';
import { UserProfile } from '../types.js';
import { syncOfflineProgress } from '../services/api.js';
import { VersionBadge } from './VersionBadge.js';

interface NavbarProps {
  profile: UserProfile | null;
  onHomeClick: () => void;
  onGamesClick?: () => void;
  onExamClick?: () => void;
  onEncyclopediaClick?: () => void;
  onWorksheetClick?: () => void;
  onStickerAlbumClick?: () => void;
  onSettingsClick: () => void;
  onMyUnitsClick?: () => void;
  onUserClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onHomeClick,
  onGamesClick,
  onExamClick,
  onEncyclopediaClick,
  onWorksheetClick,
  onStickerAlbumClick,
  onSettingsClick,
  onMyUnitsClick,
  onUserClick
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncAlert, setSyncAlert] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const synced = await syncOfflineProgress();
      if (synced > 0) {
        setSyncAlert(true);
        setTimeout(() => setSyncAlert(false), 3000);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b-2 border-magic-100 px-4 py-3 md:px-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo / Inicio */}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-2 group active:scale-95 transition-transform"
        >
          <div className="w-11 h-11 bg-magic-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-magic-300">
            <Home className="w-6 h-6" />
          </div>
          <div className="text-left hidden sm:block">
            <h1 className="text-lg font-black text-magic-700 leading-none">Mi Cuaderno</h1>
            <span className="text-xs font-bold text-slate-400">Estudio Mágico</span>
          </div>
        </button>

        {/* Puntos y Racha */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Estrellas */}
          <div className="flex items-center gap-1.5 bg-sunny-100 border border-sunny-300 px-3 py-1.5 rounded-full text-amber-900 font-extrabold text-sm md:text-base shadow-sm">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500 animate-bounce" />
            <span>{profile?.stars ?? 0}</span>
          </div>

          {/* Racha */}
          <div className="flex items-center gap-1.5 bg-bubble-100 border border-bubble-200 px-3 py-1.5 rounded-full text-rose-800 font-extrabold text-sm md:text-base shadow-sm">
            <Flame className="w-5 h-5 fill-rose-500 text-rose-500" />
            <span>{profile?.currentStreak ?? 1} {profile?.currentStreak === 1 ? 'día' : 'días'}</span>
          </div>

          {/* Estado de Red */}
          <div
            title={isOnline ? 'Conexión activa' : 'Sin conexión - Modo Offline guardado en iPad'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border ${
              isOnline
                ? 'bg-mint-50 text-emerald-700 border-mint-200'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
            <span className="hidden md:inline">{isOnline ? 'En línea' : 'Sin internet'}</span>
          </div>

          {/* Versión actual con check */}
          <VersionBadge />

          {/* Acceso Directo a Juegos */}
          {onGamesClick && (
            <button
              onClick={onGamesClick}
              title="Sala de Juegos Mágica"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-sunny-400 to-amber-500 hover:from-sunny-500 hover:to-amber-600 text-amber-950 font-black text-sm active:scale-95 transition-all shadow-sm"
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Juegos</span>
            </button>
          )}

          {/* Acceso Directo a Exámenes Reales */}
          {onExamClick && (
            <button
              onClick={onExamClick}
              title="Simulador de Exámenes Reales (Pureza de María / Madrid)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm active:scale-95 transition-all shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Exámenes</span>
            </button>
          )}

          {/* Acceso Directo a Enciclopedia Infantil */}
          {onEncyclopediaClick && (
            <button
              onClick={onEncyclopediaClick}
              title="Enciclopedia Infantil (Vikidia) y Temas por Edad"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-sm active:scale-95 transition-all shadow-sm"
            >
              <Compass className="w-4 h-4 text-teal-100" />
              <span className="hidden sm:inline">Descubrir</span>
            </button>
          )}

          {/* Acceso Directo a Fichas Imprimibles PDF */}
          {onWorksheetClick && (
            <button
              onClick={onWorksheetClick}
              title="Fichas Imprimibles y Apple Pencil"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-sm active:scale-95 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-rose-100" />
              <span className="hidden sm:inline">Fichas PDF</span>
            </button>
          )}

          {/* Acceso al Álbum de Cromos */}
          {onStickerAlbumClick && (
            <button
              onClick={onStickerAlbumClick}
              title="Álbum de Cromos Mágicos Coleccionables"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-amber-950 font-black text-sm active:scale-95 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-950" />
              <span className="hidden md:inline">Cromos</span>
            </button>
          )}

          {/* Selector de Perfil de Estudiante (Samantha) */}
          {onUserClick && (
            <button
              onClick={onUserClick}
              title="Cambiar de estudiante"
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-magic-100 hover:bg-magic-200 border border-magic-300 text-magic-900 font-black text-sm active:scale-95 transition-all shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{profile?.name || 'Samantha'}</span>
            </button>
          )}

          {/* Mis temas */}
          {onMyUnitsClick && (
            <button
              onClick={onMyUnitsClick}
              title="Mis Temas Guardados"
              className="p-2.5 rounded-2xl bg-magic-50 text-magic-700 border border-magic-200 hover:bg-magic-100 active:scale-95 transition-all"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          )}

          {/* Ajustes Padres */}
          <button
            onClick={onSettingsClick}
            title="Ajustes y PIN de Padres"
            className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {syncAlert && (
        <div className="bg-mint-500 text-white text-xs md:text-sm font-bold text-center py-1 mt-1 rounded-lg animate-fade-in">
          ✨ ¡Progreso sin conexión sincronizado con éxito!
        </div>
      )}
    </header>
  );
};
