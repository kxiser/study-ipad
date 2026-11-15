import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Printer,
  Download,
  FileText,
  Sparkles,
  CheckCircle2,
  Sliders,
  Eye,
  EyeOff,
  BookOpen,
  Award
} from 'lucide-react';
import { CURRICULUM_3_PRIMARIA, CurriculumTopic } from '../data/curriculum3Primaria.js';
import { Exercise } from '../types.js';
import { sounds } from '../utils/soundEffects.js';

interface WorksheetPageProps {
  onBack: () => void;
  initialTopicId?: string;
}

export const WorksheetPage: React.FC<WorksheetPageProps> = ({
  onBack,
  initialTopicId
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicId || CURRICULUM_3_PRIMARIA[0].id
  );
  const [studentName, setStudentName] = useState<string>('');
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [questionCount, setQuestionCount] = useState<number>(5);

  const currentTopic = useMemo(() => {
    return CURRICULUM_3_PRIMARIA.find(t => t.id === selectedTopicId) || CURRICULUM_3_PRIMARIA[0];
  }, [selectedTopicId]);

  const exercisesToPrint: Exercise[] = useMemo(() => {
    return currentTopic.exercises.slice(0, questionCount);
  }, [currentTopic, questionCount]);

  const handlePrint = () => {
    sounds.playPopSound();
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fade-in">
      {/* Barra de Controles superior (no se imprime) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-magic-200 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magic-600 to-indigo-600 hover:from-magic-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-lg shadow-magic-200 active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>Imprimir o Guardar en PDF</span>
          </button>
        </div>
      </div>

      {/* Panel de Configuración de la Ficha (no se imprime) */}
      <div className="print:hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6 rounded-3xl border-2 border-indigo-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-900 font-black text-lg">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <span>Personalizar Ficha Imprimible</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector de tema */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-indigo-800 tracking-wider">
              Asignatura y Tema:
            </label>
            <select
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white border-2 border-indigo-200 text-slate-800 font-bold text-sm outline-none focus:border-indigo-500"
            >
              {CURRICULUM_3_PRIMARIA.map(t => (
                <option key={t.id} value={t.id}>
                  {t.icon} [{t.subject}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre del alumno */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-indigo-800 tracking-wider">
              Nombre del Alumno/a:
            </label>
            <input
              type="text"
              placeholder="Ej: Sofía / Mateo..."
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white border-2 border-indigo-200 text-slate-800 font-bold text-sm outline-none focus:border-indigo-500"
            />
          </div>

          {/* Opciones adicionales */}
          <div className="flex items-center gap-4 pt-4 md:pt-6">
            <label className="flex items-center gap-2 text-sm font-extrabold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSolutions}
                onChange={e => setIncludeSolutions(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded-lg accent-indigo-600 cursor-pointer"
              />
              <span>Incluir Solucionario al final</span>
            </label>
          </div>
        </div>
      </div>

      {/* VISTA PREVIA DE LA FICHA A4 PARA IMPRESIÓN */}
      <div className="worksheet-container bg-white rounded-3xl p-8 sm:p-12 shadow-xl border-2 border-slate-300 max-w-4xl mx-auto space-y-8 text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        {/* Cabecera escolar formal */}
        <div className="border-b-4 border-slate-900 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                COLEGIO PUREZA DE MARÍA • EDUCACIÓN PRIMARIA
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Ficha de Repaso: {currentTopic.title}
              </h1>
              <p className="text-sm font-semibold text-slate-600">
                Materia: <strong>{currentTopic.subject}</strong> • Nivel: <strong>3.º de Primaria</strong>
              </p>
            </div>
            <div className="text-right border-2 border-slate-800 rounded-2xl p-3 min-w-[120px] text-center">
              <span className="text-[10px] font-black uppercase text-slate-500 block">CALIFICACIÓN</span>
              <span className="text-2xl font-black text-slate-800">___ / 10</span>
            </div>
          </div>

          {/* Datos del alumno */}
          <div className="grid grid-cols-2 gap-4 text-sm font-bold pt-2">
            <div className="border-b-2 border-dotted border-slate-400 pb-1">
              <span className="text-slate-500">Nombre del Alumno/a: </span>
              <span className="text-slate-900 font-extrabold">{studentName || '__________________________________'}</span>
            </div>
            <div className="border-b-2 border-dotted border-slate-400 pb-1 text-right">
              <span className="text-slate-500">Fecha: </span>
              <span className="text-slate-900">____ / ____ / 2026</span>
            </div>
          </div>
        </div>

        {/* Lista de Ejercicios */}
        <div className="space-y-8">
          {exercisesToPrint.map((exItem, idx) => {
            const ex = exItem as any;
            const questionText = ex.question || ex.statement || ex.textWithBlank || ex.instruction || 'Pregunta de repaso:';
            const optionsList: string[] = Array.isArray(ex.options) ? ex.options : [];

            return (
              <div key={ex.id || idx} className="space-y-3 break-inside-avoid">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug pt-0.5">
                    {questionText}
                  </p>
                </div>

                {/* Opciones con casillas para marcar o escribir */}
                {optionsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-11">
                    {optionsList.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
                      >
                        <div className="w-5 h-5 rounded-md border-2 border-slate-400 shrink-0" />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Pauta de escritura caligráfica para responder a mano */
                  <div className="pl-11 space-y-3 pt-2">
                    <div className="h-8 border-b-2 border-slate-300 border-dashed" />
                    <div className="h-8 border-b-2 border-slate-300 border-dashed" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HOJA DE SOLUCIONES (si está activada) */}
        {includeSolutions && (
          <div className="pt-12 border-t-4 border-dashed border-slate-300 space-y-4 break-before-page">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Solucionario para Padres y Profesores (Hoja de Corrección)
              </h2>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-2">
              {exercisesToPrint.map((exItem, idx) => {
                const ex = exItem as any;
                const ans = ex.correctAnswer || (ex.isTrue ? 'Verdadero' : ex.isTrue === false ? 'Falso' : 'Correcto');
                return (
                  <div key={`sol-${ex.id || idx}`} className="flex items-start gap-2">
                    <strong className="text-slate-900 shrink-0">Ejercicio {idx + 1}:</strong>
                    <span className="text-emerald-700 font-extrabold">{ans}</span>
                    {ex.explanation && <span className="text-slate-500">— {ex.explanation}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
