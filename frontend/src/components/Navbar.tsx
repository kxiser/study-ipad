import React, { useState, useEffect } from 'react';
import {
  Star,
  Flame,
  Wifi,
  WifiOff,
  Settings,
  Home,
  BookOpen,
  Gamepad2,
  GraduationCap,
  Compass,
  Printer,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleMenuSelect = (action?: () => void) => {
    setIsMenuOpen(false);
    if (action) action();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-magic-100 px-3 py-2.5 sm:px-6 w-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo / Inicio */}
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2 group active:scale-95 transition-transform shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-magic-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-magic-300">
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left hidden md:block">
              <h1 className="text-base sm:text-lg font-black text-magic-700 leading-none">Mi Cuaderno</h1>
              <span className="text-[11px] font-bold text-slate-400">Estudio Mágico</span>
            </div>
          </button>

          {/* Estadísticas e Indicadores Esenciales */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Estrellas */}
            <div className="flex items-center gap-1 bg-sunny-100 border border-sunny-300 px-2.5 py-1 rounded-full text-amber-900 font-black text-xs sm:text-sm shadow-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-bounce" />
              <span>{profile?.stars ?? 0}</span>
            </div>

            {/* Racha */}
            <div className="flex items-center gap-1 bg-bubble-100 border border-bubble-200 px-2.5 py-1 rounded-full text-rose-800 font-black text-xs sm:text-sm shadow-xs">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{profile?.currentStreak ?? 1}d</span>
            </div>

            {/* Estado de Red (visible en tablets y desktop) */}
            <div
              title={isOnline ? 'Conexión activa' : 'Sin conexión - Modo Offline guardado en iPad'}
              className={`hidden sm:flex p-1.5 rounded-full border ${
                isOnline
                  ? 'bg-mint-50 text-emerald-700 border-mint-200'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
            </div>

            {/* Selector de Perfil de Estudiante */}
            {onUserClick && (
              <button
                onClick={onUserClick}
                title="Cambiar de estudiante"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-2xl bg-magic-100 hover:bg-magic-200 border border-magic-300 text-magic-900 font-black text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="hidden sm:inline truncate max-w-[90px]">{profile?.name || 'Samantha'}</span>
                <span className="sm:hidden text-xs font-black">{(profile?.name || 'S')[0]}</span>
              </button>
            )}

            {/* Versión actual (visible en tablets y desktop; en móvil se muestra en el menú) */}
            <div className="hidden md:block shrink-0">
              <VersionBadge />
            </div>

            {/* Botón de Menú Rápido (Secciones de la App) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-magic-300 cursor-pointer"
              aria-label="Abrir menú de secciones"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="hidden md:inline">Secciones</span>
            </button>

            {/* Ajustes Padres */}
            <button
              onClick={onSettingsClick}
              title="Ajustes y PIN de Padres"
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {syncAlert && (
          <div className="bg-mint-500 text-white text-xs font-bold text-center py-1 mt-1 rounded-lg animate-fade-in">
            ✨ ¡Progreso sin conexión sincronizado con éxito!
          </div>
        )}
      </header>

      {/* MODAL / MENÚ DESPLEGABLE RESPONSIVE DE SECCIONES */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-20 animate-fade-in">
          <div
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full border-3 border-magic-200 shadow-2xl space-y-4 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌟</span>
                <h3 className="text-lg font-black text-slate-800">Secciones y Actividades</h3>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* 1. Mis Temas */}
              {onMyUnitsClick && (
                <button
                  onClick={() => handleMenuSelect(onMyUnitsClick)}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                  <span>Mis Temas</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Biblioteca de estudio</span>
                </button>
              )}

              {/* 2. Sala de Juegos */}
              {onGamesClick && (
                <button
                  onClick={() => handleMenuSelect(onGamesClick)}
                  className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <Gamepad2 className="w-6 h-6 text-amber-600" />
                  <span>Juegos Mágicos</span>
                  <span className="text-[10px] text-amber-700 font-semibold">Arcade y deportes</span>
                </button>
              )}

              {/* 3. Simulador de Exámenes */}
              {onExamClick && (
                <button
                  onClick={() => handleMenuSelect(onExamClick)}
                  className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                  <span>Exámenes Reales</span>
                  <span className="text-[10px] text-indigo-700 font-semibold">Boletín y notas</span>
                </button>
              )}

              {/* 4. Enciclopedia Infantil */}
              {onEncyclopediaClick && (
                <button
                  onClick={() => handleMenuSelect(onEncyclopediaClick)}
                  className="p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 text-teal-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <Compass className="w-6 h-6 text-teal-600" />
                  <span>Enciclopedia</span>
                  <span className="text-[10px] text-teal-700 font-semibold">Vikidia por edad</span>
                </button>
              )}

              {/* 5. Fichas PDF */}
              {onWorksheetClick && (
                <button
                  onClick={() => handleMenuSelect(onWorksheetClick)}
                  className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <Printer className="w-6 h-6 text-rose-600" />
                  <span>Fichas PDF</span>
                  <span className="text-[10px] text-rose-700 font-semibold">Imprimir / Apple Pencil</span>
                </button>
              )}

              {/* 6. Álbum de Cromos */}
              {onStickerAlbumClick && (
                <button
                  onClick={() => handleMenuSelect(onStickerAlbumClick)}
                  className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 text-orange-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <Sparkles className="w-6 h-6 text-orange-600" />
                  <span>Álbum de Cromos</span>
                  <span className="text-[10px] text-orange-700 font-semibold">Tus recompensas</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Versión instalada:</span>
              <VersionBadge />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
