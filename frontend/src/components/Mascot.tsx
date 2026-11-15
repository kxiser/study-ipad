import React, { useEffect, useState } from 'react';
import { getMascotAccessories, subscribeToAccessories, MascotAccessories } from '../utils/mascotAccessories.js';

export type MascotMood = 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'curious';

interface MascotProps {
  mood?: MascotMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mascotType?: string; // 'chispa' | 'buho' | 'luna'
  accessories?: MascotAccessories;
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'happy',
  message,
  size = 'md',
  mascotType = 'chispa',
  accessories: propAccessories
}) => {
  const [activeAcc, setActiveAcc] = useState<MascotAccessories>(propAccessories || getMascotAccessories());

  useEffect(() => {
    if (propAccessories) {
      setActiveAcc(propAccessories);
      return;
    }
    const unsub = subscribeToAccessories((newAcc) => setActiveAcc(newAcc));
    return unsub;
  }, [propAccessories]);

  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 md:w-28 md:h-28',
    lg: 'w-32 h-32 md:w-40 md:h-40',
    xl: 'w-44 h-44 md:w-52 md:h-52'
  };

  const hat = activeAcc.hat;
  const glasses = activeAcc.glasses;
  const acc = activeAcc.accessory;

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative ${sizeMap[size]} transition-transform duration-300 transform hover:scale-105`}>
        {mascotType === 'buho' ? (
          // Búho Sabio
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
            {/* Capa si está equipada */}
            {acc === 'cape' && (
              <path d="M18 70 Q50 60 82 70 L90 96 Q50 88 10 96 Z" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
            )}

            <circle cx="50" cy="55" r="38" fill="#8B5CF6" />
            <circle cx="50" cy="58" r="28" fill="#EDE9FE" />
            {/* Ojos */}
            <circle cx="36" cy="46" r="14" fill="#FFFFFF" stroke="#6D28D9" strokeWidth="2.5" />
            <circle cx="64" cy="46" r="14" fill="#FFFFFF" stroke="#6D28D9" strokeWidth="2.5" />
            {mood === 'happy' || mood === 'celebrating' ? (
              <>
                <path d="M29 46 Q36 38 43 46" fill="none" stroke="#6D28D9" strokeWidth="3" strokeLinecap="round" />
                <path d="M57 46 Q64 38 71 46" fill="none" stroke="#6D28D9" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="38" cy="46" r="6" fill="#1E1B4B" />
                <circle cx="40" cy="44" r="2" fill="#FFFFFF" />
                <circle cx="66" cy="46" r="6" fill="#1E1B4B" />
                <circle cx="68" cy="44" r="2" fill="#FFFFFF" />
              </>
            )}
            {/* Pico */}
            <polygon points="50,52 44,59 56,59" fill="#F59E0B" />
            {/* Birrete estándar */}
            <polygon points="50,14 18,25 50,33 82,25" fill="#1E1B4B" />
            <rect x="36" y="28" width="28" height="6" fill="#4338CA" rx="2" />
            <line x1="82" y1="25" x2="84" y2="40" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="84" cy="42" r="3" fill="#F59E0B" />
          </svg>
        ) : (
          // Chispa el Zorro Amistoso
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
            {/* Capa de superheroína */}
            {acc === 'cape' && (
              <g className="animate-pulse">
                <path d="M18 72 Q50 62 82 72 L92 98 Q50 88 8 98 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
                <path d="M24 76 Q50 68 76 76" stroke="#FBBF24" strokeWidth="2" fill="none" />
              </g>
            )}

            {/* Orejas */}
            <polygon points="22,45 15,12 40,28" fill="#EA580C" />
            <polygon points="22,40 18,18 36,28" fill="#FDBA74" />
            <polygon points="78,45 85,12 60,28" fill="#EA580C" />
            <polygon points="78,40 82,18 64,28" fill="#FDBA74" />

            {/* Cabeza */}
            <circle cx="50" cy="55" r="36" fill="#FB923C" />

            {/* Mejillas blancas */}
            <ellipse cx="32" cy="62" rx="15" ry="12" fill="#FFFFFF" />
            <ellipse cx="68" cy="62" rx="15" ry="12" fill="#FFFFFF" />

            {/* Ojos expresivos */}
            {mood === 'happy' || mood === 'celebrating' ? (
              <>
                <path d="M28 50 Q36 42 44 50" fill="none" stroke="#7C2D12" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M56 50 Q64 42 72 50" fill="none" stroke="#7C2D12" strokeWidth="3.5" strokeLinecap="round" />
              </>
            ) : mood === 'thinking' ? (
              <>
                <circle cx="36" cy="48" r="5" fill="#7C2D12" />
                <circle cx="64" cy="48" r="5" fill="#7C2D12" />
                <path d="M28 42 Q36 38 42 42" fill="none" stroke="#7C2D12" strokeWidth="2.5" />
              </>
            ) : (
              <>
                <circle cx="36" cy="50" r="5.5" fill="#7C2D12" />
                <circle cx="38" cy="48" r="2" fill="#FFFFFF" />
                <circle cx="64" cy="50" r="5.5" fill="#7C2D12" />
                <circle cx="66" cy="48" r="2" fill="#FFFFFF" />
              </>
            )}

            {/* Nariz */}
            <ellipse cx="50" cy="62" rx="4.5" ry="3.5" fill="#1C1917" />
            {/* Sonrisa */}
            <path d="M44 68 Q50 74 56 68" fill="none" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rubor mejillas */}
            <circle cx="26" cy="58" r="4.5" fill="#FDA4AF" opacity="0.8" />
            <circle cx="74" cy="58" r="4.5" fill="#FDA4AF" opacity="0.8" />
            {/* Bufanda / Pañuelo de explorador */}
            <path d="M24 78 Q50 92 76 78 Q50 84 24 78" fill="#8B5CF6" />

            {/* ACCESORIO: Medalla */}
            {acc === 'medal' && (
              <g>
                <path d="M46 78 L43 88 L50 85 L57 88 L54 78 Z" fill="#3B82F6" />
                <circle cx="50" cy="87" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
                <text x="50" y="89" fontSize="4" textAnchor="middle" fill="#78350F" fontWeight="bold">★</text>
              </g>
            )}

            {/* GAFAS */}
            {glasses === 'sunglasses' && (
              <g>
                <rect x="25" y="44" width="22" height="13" rx="4" fill="#0F172A" />
                <rect x="53" y="44" width="22" height="13" rx="4" fill="#0F172A" />
                <line x1="47" y1="49" x2="53" y2="49" stroke="#0F172A" strokeWidth="3" />
                <line x1="28" y1="46" x2="36" y2="54" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <line x1="56" y1="46" x2="64" y2="54" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              </g>
            )}

            {glasses === 'stars' && (
              <g>
                {/* Estrella izquierda */}
                <polygon points="36,40 39,47 46,47 41,52 43,59 36,54 29,59 31,52 26,47 33,47" fill="#EC4899" stroke="#BE185D" strokeWidth="1.5" />
                {/* Estrella derecha */}
                <polygon points="64,40 67,47 74,47 69,52 71,59 64,54 57,59 59,52 54,47 61,47" fill="#EC4899" stroke="#BE185D" strokeWidth="1.5" />
                <line x1="46" y1="48" x2="54" y2="48" stroke="#BE185D" strokeWidth="2.5" />
              </g>
            )}

            {/* SOMBREROS */}
            {hat === 'wizard' && (
              <g>
                {/* Ala del sombrero */}
                <ellipse cx="50" cy="27" rx="28" ry="7" fill="#581C87" stroke="#3B0764" strokeWidth="1.5" />
                {/* Cono */}
                <polygon points="30,27 50,-5 70,27" fill="#6B21A8" stroke="#3B0764" strokeWidth="1.5" />
                {/* Cinta amarilla con estrellas */}
                <path d="M33 24 Q50 28 67 24 L69 27 Q50 31 31 27 Z" fill="#FBBF24" />
                <text x="50" y="14" fontSize="8" textAnchor="middle" fill="#FDE047">★</text>
              </g>
            )}

            {hat === 'crown' && (
              <g>
                <polygon points="28,26 26,10 38,18 50,6 62,18 74,10 72,26" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="26" cy="9" r="2.5" fill="#EF4444" />
                <circle cx="50" cy="5" r="3" fill="#3B82F6" />
                <circle cx="74" cy="9" r="2.5" fill="#10B981" />
                <rect x="28" y="24" width="44" height="4" rx="1" fill="#D97706" />
              </g>
            )}

            {hat === 'cap' && (
              <g>
                {/* Gorra deportiva */}
                <ellipse cx="50" cy="24" rx="25" ry="10" fill="#2563EB" />
                <path d="M46 24 Q78 22 84 29 Q62 34 46 24" fill="#1D4ED8" />
                <circle cx="50" cy="18" r="2.5" fill="#FBBF24" />
              </g>
            )}

            {hat === 'astronaut' && (
              <g>
                <circle cx="50" cy="52" r="38" fill="#38BDF8" opacity="0.25" stroke="#0284C7" strokeWidth="3" />
                <ellipse cx="34" cy="36" rx="6" ry="3" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 34 36)" />
              </g>
            )}

            {/* ACCESORIO: Varita mágica */}
            {acc === 'wand' && (
              <g className="animate-bounce">
                <line x1="84" y1="78" x2="94" y2="40" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                <polygon points="94,34 96,39 101,39 97,42 99,47 94,44 89,47 91,42 87,39 92,39" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
                <circle cx="94" cy="40" r="8" fill="#FDE047" opacity="0.3" />
              </g>
            )}
          </svg>
        )}
      </div>

      {message && (
        <div className="relative bg-white/95 backdrop-blur-sm border-2 border-magic-200 px-4 py-2.5 rounded-2xl shadow-sm max-w-xs md:max-w-md animate-fade-in text-slate-700 font-bold text-sm md:text-base">
          {message}
          {/* Triángulo del globo de diálogo */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
        </div>
      )}
    </div>
  );
};
