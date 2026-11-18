import React from 'react';

interface EducationalIllustrationProps {
  text: string;
  subject?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface IllustrationDef {
  keywords: string[];
  emoji: string;
  bgGradient: string;
  badge: string;
  subtitle: string;
}

const ILLUSTRATIONS: IllustrationDef[] = [
  // Lengua Castellana
  {
    keywords: ['aguda', 'agudas', 'tilde en la última', 'balón', 'camión', 'canción', 'café'],
    emoji: '⚡',
    bgGradient: 'from-amber-400 via-orange-500 to-rose-500',
    badge: 'Palabra Aguda',
    subtitle: 'Fuerza en la última sílaba'
  },
  {
    keywords: ['llana', 'llanas', 'árbol', 'lápiz', 'azúcar', 'penúltima'],
    emoji: '🎯',
    bgGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    badge: 'Palabra Llana',
    subtitle: 'Fuerza en la penúltima sílaba'
  },
  {
    keywords: ['esdrújula', 'esdrújulas', 'brújula', 'música', 'teléfono', 'pájaro', 'antepenúltima'],
    emoji: '✨',
    bgGradient: 'from-purple-500 via-indigo-600 to-pink-500',
    badge: 'Palabra Esdrújula',
    subtitle: '¡Siempre lleva tilde!'
  },
  {
    keywords: ['sustantivo', 'nombre', 'propio', 'común', 'individual', 'colectivo'],
    emoji: '🏷️',
    bgGradient: 'from-blue-400 via-indigo-500 to-violet-600',
    badge: 'Gramática',
    subtitle: 'Nombra personas, cosas y seres'
  },
  {
    keywords: ['adjetivo', 'calificativo', 'cualidad', 'cómo es'],
    emoji: '🎨',
    bgGradient: 'from-pink-400 via-rose-500 to-amber-500',
    badge: 'Adjetivo',
    subtitle: 'Describe cómo es o está'
  },
  {
    keywords: ['abecedario', 'alfabeto', 'orden alfabético', 'diccionario', 'letras'],
    emoji: '🔤',
    bgGradient: 'from-yellow-400 via-amber-500 to-orange-500',
    badge: 'El Abecedario',
    subtitle: '27 letras del español'
  },

  // Matemáticas
  {
    keywords: ['multiplicar', 'multiplicación', 'tabla', 'por', 'producto', 'factores', 'doble', 'triple'],
    emoji: '✖️',
    bgGradient: 'from-indigo-500 via-purple-600 to-pink-600',
    badge: 'Cálculo Mental',
    subtitle: 'Multiplicaciones y Tablas'
  },
  {
    keywords: ['dividir', 'división', 'repartir', 'mitad', 'tercio', 'cuarto', 'resto', 'cociente'],
    emoji: '➗',
    bgGradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    badge: 'Repartos Iguales',
    subtitle: 'Iniciación a la División'
  },
  {
    keywords: ['reloj', 'hora', 'minuto', 'en punto', 'y media', 'y cuarto', 'tiempo'],
    emoji: '⏰',
    bgGradient: 'from-amber-400 via-orange-500 to-yellow-600',
    badge: 'Medida del Tiempo',
    subtitle: 'Horas y minutos del reloj'
  },
  {
    keywords: ['euro', 'céntimo', 'moneda', 'billete', 'precio', 'comprar', 'pagar'],
    emoji: '💶',
    bgGradient: 'from-emerald-500 via-teal-600 to-green-700',
    badge: 'Euros y Céntimos',
    subtitle: 'El dinero de España y Europa'
  },
  {
    keywords: ['número', 'cifras', 'centena', 'decena', 'unidad de millar', '99.999', 'descomposición'],
    emoji: '🔢',
    bgGradient: 'from-blue-500 via-sky-600 to-cyan-500',
    badge: 'Numeración',
    subtitle: 'Valor posicional de cifras'
  },

  // Ciencias de la Naturaleza
  {
    keywords: ['vertebrado', 'vertebrados', 'huesos', 'columna vertebral', 'esqueleto'],
    emoji: '🦁',
    bgGradient: 'from-amber-500 via-orange-600 to-yellow-600',
    badge: 'Animales Vertebrados',
    subtitle: 'Esqueleto y columna interna'
  },
  {
    keywords: ['invertebrado', 'invertebrados', 'artrópodo', 'insecto', 'molusco', 'araña', 'sin columna'],
    emoji: '🦋',
    bgGradient: 'from-teal-500 via-emerald-600 to-green-600',
    badge: 'Animales Invertebrados',
    subtitle: 'Sin huesos internos'
  },
  {
    keywords: ['mamífero', 'mamíferos', 'leche', 'vientre', 'vivíparo'],
    emoji: '🐶',
    bgGradient: 'from-orange-400 via-amber-500 to-yellow-500',
    badge: 'Mamíferos',
    subtitle: 'Nacen del vientre materno'
  },
  {
    keywords: ['ave', 'aves', 'pájaro', 'plumas', 'pico', 'alas'],
    emoji: '🦅',
    bgGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    badge: 'Aves',
    subtitle: 'Cuerpo cubierto de plumas'
  },
  {
    keywords: ['pez', 'peces', 'branquias', 'escamas', 'aletas'],
    emoji: '🐠',
    bgGradient: 'from-cyan-400 via-blue-500 to-teal-600',
    badge: 'Peces',
    subtitle: 'Respiran oxígeno del agua'
  },
  {
    keywords: ['planta', 'plantas', 'árbol', 'hojas', 'fotosíntesis', 'raíz', 'oxígeno', 'flor'],
    emoji: '🌿',
    bgGradient: 'from-green-500 via-emerald-600 to-teal-700',
    badge: 'Reino Vegetal',
    subtitle: 'Fabrican su propio alimento'
  },

  // Ciencias Sociales
  {
    keywords: ['planeta', 'tierra', 'sol', 'luna', 'sistema solar', 'rotación', 'traslación', 'universo'],
    emoji: '🪐',
    bgGradient: 'from-indigo-600 via-purple-700 to-slate-900',
    badge: 'Astronomía',
    subtitle: 'La Tierra y el Sistema Solar'
  },
  {
    keywords: ['montaña', 'sierra', 'cordillera', 'relieve', 'llanura', 'meseta', 'valle', 'paisaje'],
    emoji: '⛰️',
    bgGradient: 'from-stone-500 via-amber-700 to-emerald-800',
    badge: 'Geografía y Relieve',
    subtitle: 'Las formas de la Tierra'
  },
  {
    keywords: ['río', 'ríos', 'agua', 'océano', 'mar', 'afluente', 'caudal', 'vertiente'],
    emoji: '🌊',
    bgGradient: 'from-sky-500 via-blue-600 to-indigo-700',
    badge: 'Aguas de España',
    subtitle: 'Ríos, mares y lagos'
  },
  {
    keywords: ['municipio', 'ayuntamiento', 'alcalde', 'alcaldesa', 'ciudad', 'pueblo', 'servicios públicos'],
    emoji: '🏛️',
    bgGradient: 'from-blue-600 via-indigo-700 to-purple-800',
    badge: 'La Localidad',
    subtitle: 'Organización ciudadana'
  }
];

export const EducationalIllustration: React.FC<EducationalIllustrationProps> = ({
  text,
  subject,
  className = '',
  size = 'md'
}) => {
  const normalized = text.toLowerCase();

  // Buscar coincidencia de ilustración temática
  const match = ILLUSTRATIONS.find(item =>
    item.keywords.some(kw => normalized.includes(kw))
  );

  if (!match) {
    // Si no hay palabra clave específica, elegir por materia o por defecto
    const defaultEmoji = subject?.includes('Mate') ? '🔢' : subject?.includes('Social') ? '🌍' : subject?.includes('Natur') ? '🌿' : '📖';
    const defaultGradient = subject?.includes('Mate') ? 'from-blue-500 to-indigo-600' : subject?.includes('Social') ? 'from-purple-500 to-indigo-700' : subject?.includes('Natur') ? 'from-emerald-500 to-teal-700' : 'from-rose-500 to-pink-600';

    return (
      <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 shadow-sm ${className}`}>
        <span className="text-xl">{defaultEmoji}</span>
        <span className="text-xs font-black uppercase tracking-wider">{subject || 'Educación Primaria'}</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base'
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${match.bgGradient} p-3.5 sm:p-4 text-white shadow-lg border-2 border-white/30 flex items-center gap-3.5 animate-scale-up ${className}`}>
      {/* Fondo brillante difuminado */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl pointer-events-none" />

      {/* Emoji gigante del concepto con círculo */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0 border border-white/40">
        <span className="animate-bounce" style={{ animationDuration: '3s' }}>{match.emoji}</span>
      </div>

      {/* Textos educativos explicativos */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {match.badge}
          </span>
        </div>
        <p className="text-xs sm:text-sm font-black text-white/95 leading-tight truncate">
          {match.subtitle}
        </p>
      </div>
    </div>
  );
};
