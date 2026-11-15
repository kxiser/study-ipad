import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Star, RotateCcw, Download, Eraser, Palette, Trophy, Check } from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { Mascot } from '../Mascot.js';
import { completeStudySession } from '../../services/api.js';

interface Mission {
  id: string;
  emoji: string;
  title: string;
  prompt: string;
  topic: string;
  suggestedColors: string[];
}

const DRAWING_MISSIONS: Mission[] = [
  {
    id: 'm-montana',
    emoji: '⛰️',
    title: 'La Montaña y su Cima',
    prompt: 'Dibuja una montaña muy alta. Con una estrella o color brillante, ¡señala la CIMA!',
    topic: 'Las Montañas',
    suggestedColors: ['#64748b', '#22c55e', '#facc15', '#0284c7']
  },
  {
    id: 'm-naturaleza',
    emoji: '🌻',
    title: 'Campo Florido y Prado',
    prompt: 'Dibuja un prado verde lleno de margaritas, amapolas rojas y un sol radiante.',
    topic: 'Las Plantas',
    suggestedColors: ['#16a34a', '#ef4444', '#facc15', '#38bdf8']
  },
  {
    id: 'm-espacio',
    emoji: '🪐',
    title: 'El Sistema Solar y la Tierra',
    prompt: 'Dibuja el planeta Tierra en el espacio junto a la Luna y estrellas brillantes.',
    topic: 'El Universo',
    suggestedColors: ['#0284c7', '#10b981', '#facc15', '#e2e8f0']
  },
  {
    id: 'm-animales',
    emoji: '🦊',
    title: 'Animales Mágicos del Bosque',
    prompt: 'Dibuja a un simpático zorro o un búho en la rama de un roble.',
    topic: 'Los Seres Vivos',
    suggestedColors: ['#ea580c', '#854d0e', '#10b981', '#facc15']
  },
  {
    id: 'm-agua',
    emoji: '💧',
    title: 'El Ciclo del Agua',
    prompt: 'Dibuja una nube esponjosa en el cielo dejando caer gotas de lluvia sobre un río.',
    topic: 'El Ciclo del Agua',
    suggestedColors: ['#38bdf8', '#0284c7', '#facc15', '#22c55e']
  },
  {
    id: 'm-libre',
    emoji: '🎨',
    title: 'Pizarra Mágica Libre',
    prompt: '¡Dibuja lo que quieras! Crea tu propia obra de arte mágica para Chispa.',
    topic: 'Creatividad Libre',
    suggestedColors: ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981']
  }
];

const PALETTE = [
  { name: 'Mágico', color: '#8b5cf6' },
  { name: 'Azul Mar', color: '#0284c7' },
  { name: 'Celeste', color: '#38bdf8' },
  { name: 'Verde Hoja', color: '#22c55e' },
  { name: 'Amarillo Sol', color: '#facc15' },
  { name: 'Naranja Chispa', color: '#f97316' },
  { name: 'Rosa Pastel', color: '#ec4899' },
  { name: 'Rojo Fuego', color: '#ef4444' },
  { name: 'Tierra Marrón', color: '#78350f' },
  { name: 'Gris Roca', color: '#64748b' },
  { name: 'Noche Negra', color: '#0f172a' }
];

const BRUSH_SIZES = [
  { label: 'Fino', size: 4 },
  { label: 'Medio', size: 10 },
  { label: 'Grueso', size: 22 }
];

interface DrawingGameProps {
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

export const DrawingGame: React.FC<DrawingGameProps> = ({ onBack, onStarsEarned }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#0284c7');
  const [brushSize, setBrushSize] = useState<number>(10);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const mission = DRAWING_MISSIONS[currentMissionIdx];

  // Configurar resolución retina y tamaño del canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Tamaño responsive ajustado para iPad
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Fondo blanco suave
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Guardar estado inicial para deshacer
    try {
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
    } catch {}
  }, []);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : currentColor;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    try {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev.slice(-10), snap]);
    } catch {}
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.playWobbleSound();
    const newHistory = history.slice(0, -1);
    const previous = newHistory[newHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.playPopSound();
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    try {
      const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([blank]);
    } catch {}
  };

  const handleFinishDrawing = () => {
    sounds.playVictorySound();
    setShowCelebration(true);
    setIsFinished(true);

    const starsEarned = 5;
    completeStudySession({
      sessionType: 'new',
      durationSeconds: 60,
      totalQuestions: 1,
      correctAnswers: 1,
      starsEarned
    }).catch(() => {});

    if (onStarsEarned) onStarsEarned(starsEarned);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `dibujo-magico-${mission.id}.png`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 animate-fade-in space-y-4">
      {showCelebration && <ConfettiCelebration />}

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1.5 rounded-full font-black text-sm shadow-md">
          <Palette className="w-4 h-4" />
          <span>Pizarra Mágica</span>
        </div>

        <button
          onClick={handleUndo}
          disabled={history.length <= 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 font-bold text-xs disabled:opacity-40 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Deshacer</span>
        </button>
      </div>

      {/* Tarjeta de Reto Didáctico */}
      <div className="bg-gradient-to-r from-sunny-100 via-amber-50 to-orange-100 rounded-3xl p-4 border-2 border-sunny-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{mission.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-amber-950">{mission.title}</h3>
              <span className="text-[11px] font-bold bg-sunny-200 text-amber-900 px-2 py-0.5 rounded-full">{mission.topic}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-amber-900/90 mt-0.5">{mission.prompt}</p>
          </div>
        </div>

        {/* Selector de Retos */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setCurrentMissionIdx(prev => (prev - 1 + DRAWING_MISSIONS.length) % DRAWING_MISSIONS.length);
              handleClear();
            }}
            className="w-8 h-8 rounded-full bg-white text-amber-900 border border-amber-300 flex items-center justify-center font-black active:scale-90"
          >
            ‹
          </button>
          <span className="text-xs font-black text-amber-900">{currentMissionIdx + 1}/{DRAWING_MISSIONS.length}</span>
          <button
            onClick={() => {
              setCurrentMissionIdx(prev => (prev + 1) % DRAWING_MISSIONS.length);
              handleClear();
            }}
            className="w-8 h-8 rounded-full bg-white text-amber-900 border border-amber-300 flex items-center justify-center font-black active:scale-90"
          >
            ›
          </button>
        </div>
      </div>

      {/* Lienzo Canvas Táctil */}
      <div className="relative bg-white rounded-3xl shadow-xl border-4 border-magic-200 overflow-hidden touch-none select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          className="w-full h-[400px] sm:h-[480px] cursor-crosshair block"
        />

        {/* Chispa animado animando al artista */}
        <div className="absolute top-3 right-3 pointer-events-none opacity-90 hidden sm:block">
          <Mascot size="sm" mood="happy" message="¡Qué artista!" />
        </div>
      </div>

      {/* Barra de Herramientas Didáctica */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border-2 border-slate-200 shadow-md space-y-3">
        {/* Paleta de Colores */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">Colores:</span>
          {PALETTE.map(item => (
            <button
              key={item.color}
              onClick={() => {
                setCurrentColor(item.color);
                setIsEraser(false);
                sounds.playPopSound();
              }}
              style={{ backgroundColor: item.color }}
              title={item.name}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 shadow-sm transition-transform active:scale-90 border-2 ${
                !isEraser && currentColor === item.color
                  ? 'scale-110 border-slate-900 ring-2 ring-magic-400'
                  : 'border-white'
              }`}
            />
          ))}
        </div>

        {/* Pinceles, Goma y Acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Tamaños de trazo */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Grosor:</span>
            {BRUSH_SIZES.map(b => (
              <button
                key={b.size}
                onClick={() => {
                  setBrushSize(b.size);
                  sounds.playPopSound();
                }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 ${
                  brushSize === b.size
                    ? 'bg-magic-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Goma y Limpiar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEraser(true);
                sounds.playPopSound();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 ${
                isEraser
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Goma</span>
            </button>

            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-black text-xs active:scale-95 transition-all"
            >
              Borrar todo
            </button>
          </div>

          {/* Botón Terminar Dibujo */}
          <button
            onClick={handleFinishDrawing}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-200 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>¡Terminado! (Ganar 5 ⭐)</span>
          </button>
        </div>
      </div>

      {/* Modal de Celebración de Dibujo */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-4 border-magic-200">
            <Trophy className="w-14 h-14 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-slate-800">¡Obra de Arte Mágica!</h3>
            <p className="text-xs font-bold text-slate-500">
              Chispa está súper orgulloso de tu dibujo sobre <strong>{mission.topic}</strong>. ¡Has ganado 5 Estrellas Mágicas!
            </p>

            <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-lg py-1">
              <Star className="w-6 h-6 fill-amber-400" />
              <span>+5 Estrellas</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Guardar dibujo en el iPad</span>
              </button>

              <button
                onClick={() => {
                  setIsFinished(false);
                  setShowCelebration(false);
                  handleClear();
                  setCurrentMissionIdx(prev => (prev + 1) % DRAWING_MISSIONS.length);
                }}
                className="w-full py-3 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-xs active:scale-95 transition-all"
              >
                Dibujar siguiente reto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
