import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw, Sparkles, X, ShieldCheck } from 'lucide-react';
import { APP_VERSION, APP_BUILD, VERSION_CHANGELOG } from '../version.js';

interface VersionBadgeProps {
  variant?: 'navbar' | 'footer';
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({ variant = 'navbar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);

  const checkVersion = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/version', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setServerVersion(data.version);
        if (data.version && data.version !== APP_VERSION) {
          setHasUpdate(true);
        } else {
          setHasUpdate(false);
        }
      }
    } catch {
      // Si estamos offline
      setServerVersion('Modo sin conexión');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkVersion();
  }, []);

  const handleForceRefresh = async () => {
    try {
      // Limpiar caches de Service Worker si existen
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const r of registrations) {
          await r.unregister();
        }
      }
      // Limpiar claves antiguas de localstorage de unidades si procede
      localStorage.removeItem('study_cached_units');
      localStorage.removeItem('study_cached_units_v2');
    } catch (e) {
      console.warn('Error limpiando caché:', e);
    }
    // Recarga forzada
    window.location.reload();
  };

  if (variant === 'footer') {
    return (
      <button
        onClick={() => {
          checkVersion();
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[11px] transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>v{APP_VERSION}</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          checkVersion();
          setIsOpen(true);
        }}
        title="Ver versión y estado del sistema"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black transition-all active:scale-95 shadow-sm border ${
          hasUpdate
            ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>v{APP_VERSION}</span>
      </button>

      {/* Modal interactivo de versión */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-magic-200 space-y-4">
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-magic-500 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Estado del Sistema</h3>
                  <p className="text-xs font-bold text-slate-400">Control de versión y despliegue</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center active:scale-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tarjetas de Estado */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-slate-400 block">Versión en Pantalla</span>
                <span className="text-base font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  v{APP_VERSION}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{APP_BUILD}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-slate-400 block">Servidor Cloud</span>
                <span className="text-base font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                  {isChecking ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-magic-500" />
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${hasUpdate ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  )}
                  {serverVersion ? `v${serverVersion}` : 'Consultando...'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {hasUpdate ? '¡Actualización lista!' : 'Sincronizado'}
                </span>
              </div>
            </div>

            {/* Novedades de la versión */}
            <div className="bg-magic-50/60 border border-magic-100 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-magic-800">
                <Sparkles className="w-4 h-4 text-magic-600" />
                <span>Novedades v{APP_VERSION} ({VERSION_CHANGELOG[0]?.date}):</span>
              </div>
              <ul className="text-xs text-slate-600 font-medium space-y-1.5 pl-1">
                {VERSION_CHANGELOG[0]?.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-magic-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleForceRefresh}
                className="flex-1 py-3 px-4 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-magic-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar y Aplicar Cambios</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs md:text-sm active:scale-95 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
