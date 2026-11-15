import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, ArrowLeft, Sparkles, AlertTriangle, WifiOff, Loader2 } from 'lucide-react';
import { scanPages } from '../services/api.js';
import { Mascot } from '../components/Mascot.js';
import { ExerciseSet } from '../types.js';

interface ScanPageProps {
  onBack: () => void;
  onSuccess: (unitId: string, set: ExerciseSet) => void;
  mascotType?: string;
}

const SUBJECT_OPTIONS = [
  'Ciencias Naturales',
  'Matemáticas',
  'Lengua Castellana',
  'Ciencias Sociales',
  'Inglés',
  'Música',
  'Otro'
];

export const ScanPage: React.FC<ScanPageProps> = ({ onBack, onSuccess, mascotType = 'chispa' }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [subject, setSubject] = useState<string>('Ciencias Naturales');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analizando imágenes...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isOnline = navigator.onLine;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Generar previsualizaciones
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviews(prev => [...prev, url]);
    });

    setErrorMessage(null);
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Por favor, haz una foto o selecciona al menos una página de tu libro.');
      return;
    }

    if (!isOnline) {
      setErrorMessage(
        'Estás sin conexión a internet. Para generar ejercicios nuevos necesitas conexión Wi-Fi con el servidor o acceder en red local a Ollama. Mientras tanto puedes repasar tus temas guardados.'
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setLoadingStep('Comprimiendo y preparando las páginas...');

    const timer1 = setTimeout(() => setLoadingStep('Leyendo el texto y las ilustraciones del libro con IA...'), 1200);
    const timer2 = setTimeout(() => setLoadingStep('Creando actividades divertidas y adaptadas para ti...'), 3500);

    try {
      const result = await scanPages(selectedFiles, subject);
      clearTimeout(timer1);
      clearTimeout(timer2);
      onSuccess(result.unitId, result.exerciseSet);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setErrorMessage(err.message || 'Error al procesar las fotos con la IA. Asegúrate de que el backend esté encendido.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fade-in">
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 text-slate-600 font-extrabold hover:text-magic-600 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Inicio</span>
        </button>

        <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-100 px-3 py-1 rounded-full">
          📸 Modo Escáner iPad
        </span>
      </div>

      {/* Aviso Offline si no hay internet */}
      {!isOnline && (
        <div className="bg-amber-50 border-3 border-amber-300 rounded-3xl p-5 shadow-sm flex items-start gap-4 text-amber-950">
          <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
            <WifiOff className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-lg">Sin conexión a Internet</h4>
            <p className="text-sm font-semibold leading-relaxed">
              El botón de escanear requiere conexión a internet (o estar en la red WiFi de casa con el servidor local).
              No te preocupes: puedes volver al inicio y repasar los temas que ya tienes guardados en tu iPad sin gastar datos.
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta Principal */}
      <div className="bg-white rounded-4xl p-6 md:p-8 shadow-lg border-3 border-magic-100 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">
            Foto a las Páginas de tu Libro
          </h2>
          <p className="text-slate-500 font-bold text-sm md:text-base">
            Coloca el libro en una mesa con buena luz y haz una o varias fotos claras.
          </p>
        </div>

        {/* Selector de Asignatura */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Materia / Asignatura del libro:
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_OPTIONS.map(sub => (
              <button
                key={sub}
                type="button"
                disabled={loading}
                onClick={() => setSubject(sub)}
                className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all active:scale-95 border-2 ${
                  subject === sub
                    ? 'bg-magic-600 text-white border-magic-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-magic-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Input file capture invisible para Safari iPad */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />

        {/* Botones de Captura Táctiles Grandes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-3xl border-3 border-dashed border-magic-300 bg-magic-50/70 hover:bg-magic-100/70 text-magic-800 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
          >
            <div className="w-14 h-14 rounded-2xl bg-magic-500 text-white flex items-center justify-center shadow-md shadow-magic-300">
              <Camera className="w-8 h-8" />
            </div>
            <span className="font-black text-lg">Tomar Foto con la Cámara</span>
            <span className="text-xs text-magic-600 font-semibold">Toca para abrir la cámara del iPad</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              // Si quiere elegir de la galería sin disparar la cámara directamente
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
                setTimeout(() => {
                  fileInputRef.current?.setAttribute('capture', 'environment');
                }, 500);
              }
            }}
            className="p-6 rounded-3xl border-3 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <span className="font-black text-lg">Elegir de la Galería</span>
            <span className="text-xs text-slate-500 font-semibold">Si ya hiciste las fotos antes</span>
          </button>
        </div>

        {/* Previsualización de Fotos Seleccionadas */}
        {previews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Páginas listas ({previews.length}):
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-extrabold text-magic-600 hover:underline"
              >
                + Añadir otra página
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previews.map((url, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border-2 border-slate-200 aspect-[3/4] bg-slate-100 group shadow-sm">
                  <img src={url} alt={`Página ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white font-black text-xs px-2 py-0.5 rounded-md">
                    Pág. {idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    disabled={loading}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition-colors"
                    title="Eliminar esta foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="bg-bubble-50 border-2 border-bubble-200 rounded-2xl p-4 flex items-center gap-3 text-rose-900 font-bold text-sm animate-shake">
            <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botón Acción Principal */}
        <div className="pt-2">
          <button
            type="button"
            disabled={loading || selectedFiles.length === 0}
            onClick={handleProcess}
            className={`w-full py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-98 ${
              selectedFiles.length > 0 && !loading
                ? 'bg-gradient-to-r from-magic-600 via-indigo-600 to-magic-700 text-white shadow-magic-300 hover:shadow-magic-400'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span>Creando tus actividades...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-7 h-7 text-sunny-300" />
                <span>¡Crear Actividades Mágicas!</span>
              </>
            )}
          </button>
        </div>

        {/* Estado animado mientras procesa */}
        {loading && (
          <div className="bg-magic-50 rounded-3xl p-6 border-2 border-magic-200 flex flex-col items-center text-center space-y-4 animate-fade-in">
            <Mascot
              mascotType={mascotType}
              mood="thinking"
              size="md"
              message={loadingStep}
            />
            <p className="text-xs text-slate-500 font-semibold max-w-sm">
              La IA está leyendo tus páginas para crear juegos a tu medida. Las fotos se borrarán inmediatamente tras el análisis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
