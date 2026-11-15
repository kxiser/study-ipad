import React, { useState, useEffect } from 'react';
import { checkServerHealth, updateMascotPreference } from '../services/api.js';
import { ArrowLeft, Cpu, ShieldCheck, Heart, Sparkles, Check } from 'lucide-react';
import { Mascot } from '../components/Mascot.js';

interface SettingsPageProps {
  onBack: () => void;
  currentMascot: string;
  onMascotChange: (mascot: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  currentMascot,
  onMascotChange
}) => {
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServerHealth()
      .then(info => {
        setServerInfo(info);
        setLoading(false);
      })
      .catch(err => {
        setServerInfo({ status: 'offline', error: err.message });
        setLoading(false);
      });
  }, []);

  const handleSelectMascot = async (type: string) => {
    onMascotChange(type);
    await updateMascotPreference(type);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fade-in">
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 font-extrabold hover:text-magic-600 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Inicio</span>
        </button>

        <span className="text-xs font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          ⚙️ Ajustes y Diagnóstico
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800">
          Ajustes de la Aplicación
        </h2>
        <p className="text-slate-500 font-bold text-sm">
          Configuración pedagógica y estado de los proveedores de inteligencia artificial.
        </p>
      </div>

      {/* 1. Elegir Mascota */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-magic-100 space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-black text-slate-800">Elige la Mascota de Estudio</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Chispa */}
          <button
            type="button"
            onClick={() => handleSelectMascot('chispa')}
            className={`p-4 rounded-2xl border-3 flex flex-col items-center gap-3 transition-all active:scale-95 ${
              currentMascot === 'chispa'
                ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-200'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Mascot mascotType="chispa" size="md" mood="happy" />
            <div className="text-center">
              <span className="font-black text-slate-800 text-sm md:text-base block">Chispa el Zorro</span>
              <span className="text-xs text-slate-500 font-medium">Aventurero y alegre</span>
            </div>
            {currentMascot === 'chispa' && (
              <span className="text-xs font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Seleccionado
              </span>
            )}
          </button>

          {/* Búho Sabio */}
          <button
            type="button"
            onClick={() => handleSelectMascot('buho')}
            className={`p-4 rounded-2xl border-3 flex flex-col items-center gap-3 transition-all active:scale-95 ${
              currentMascot === 'buho'
                ? 'bg-magic-50 border-magic-400 ring-4 ring-magic-200'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Mascot mascotType="buho" size="md" mood="happy" />
            <div className="text-center">
              <span className="font-black text-slate-800 text-sm md:text-base block">Búho Sabio</span>
              <span className="text-xs text-slate-500 font-medium">Curioso y paciente</span>
            </div>
            {currentMascot === 'buho' && (
              <span className="text-xs font-black bg-magic-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Seleccionado
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Diagnóstico del Proveedor de IA */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-magic-100 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-magic-600" />
          <h3 className="text-lg font-black text-slate-800">Proveedor de IA Activo</h3>
        </div>

        {loading ? (
          <p className="text-sm font-bold text-slate-400">Consultando backend...</p>
        ) : serverInfo?.status === 'offline' ? (
          <div className="bg-bubble-50 border-2 border-bubble-200 rounded-2xl p-4 text-rose-900 text-sm font-bold">
            No se pudo conectar al backend Fastify. Verifica que esté iniciado en el puerto 4000.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-sm font-bold text-slate-600">Proveedor configurado:</span>
              <span className="font-black text-sm text-magic-700 bg-magic-100 px-3 py-1 rounded-full">
                {serverInfo.providerName || serverInfo.provider}
              </span>
            </div>

            <div className="text-xs font-medium text-slate-600 space-y-2 bg-magic-50/70 p-4 rounded-2xl border border-magic-200">
              <p className="font-bold text-slate-800">💡 Opciones de coste y privacidad:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong className="text-magic-700">Ollama (100% Gratis y Privado):</strong> Corre en tu ordenador en la red Wi-Fi de casa (`docker-compose.local.yml`) con modelos como `llama3.2-vision`. No requiere tarjetas de crédito ni internet.
                </li>
                <li>
                  <strong className="text-magic-700">Google Gemini Flash (Free Tier Oficial):</strong> Capa gratuita oficial de 15 peticiones/minuto en Google AI Studio (`AI_PROVIDER=gemini`). Coste $0 para estudiar todos los días.
                </li>
                <li>
                  <strong className="text-magic-700">Claude Sonnet (Anthropic):</strong> Máxima precisión didáctica en español (`AI_PROVIDER=claude`), coste de ~0.01$ por página.
                </li>
                <li>
                  <strong className="text-magic-700">Modo Demo / Ejemplo:</strong> Funciona offline sin configurar ninguna clave (`AI_PROVIDER=mock`).
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 3. Privacidad */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-magic-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-mint-100 text-emerald-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-base text-slate-800">Privacidad y Protección Infantil</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Las fotografías de los libros escolares nunca se guardan en el disco del servidor ni en bases de datos.
            Se procesan en la memoria RAM temporal para generar las preguntas en formato JSON y se destruyen inmediatamente.
          </p>
        </div>
      </div>
    </div>
  );
};
