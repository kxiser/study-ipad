import React from 'react';

export type MascotMood = 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'curious';

interface MascotProps {
  mood?: MascotMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  mascotType?: string; // 'chispa' | 'buho' | 'luna'
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'happy',
  message,
  size = 'md',
  mascotType = 'chispa'
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 md:w-28 md:h-28',
    lg: 'w-32 h-32 md:w-40 md:h-40'
  };

  // Renderizado SVG de Chispa el Zorro Astronauta o Búho
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative ${sizeMap[size]} transition-transform duration-300 transform hover:scale-105`}>
        {mascotType === 'buho' ? (
          // Búho Sabio
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
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
            {/* Birrete */}
            <polygon points="50,14 18,25 50,33 82,25" fill="#1E1B4B" />
            <rect x="36" y="28" width="28" height="6" fill="#4338CA" rx="2" />
            <line x1="82" y1="25" x2="84" y2="40" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="84" cy="42" r="3" fill="#F59E0B" />
          </svg>
        ) : (
          // Chispa el Zorro Amistoso
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
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
