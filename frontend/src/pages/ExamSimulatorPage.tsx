import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Printer,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Star,
  Sparkles,
  BookOpen,
  Volume2,
  Check,
  AlertCircle,
  PenLine,
  LayoutGrid
} from 'lucide-react';
import { SpeechButton } from '../components/SpeechButton.js';
import { ConfettiCelebration } from '../components/ConfettiCelebration.js';
import { sounds } from '../utils/soundEffects.js';
import { completeStudySession, fetchUnits, fetchUnit } from '../services/api.js';
import { getDynamicGameQuestions, VERIFIED_FACTS, GameQuestion } from '../utils/questionReformulator.js';
import { ExerciseItem, UserProfile } from '../types.js';
import { validateWrittenAnswer } from '../utils/answerValidator.js';

interface ExamSimulatorPageProps {
  profile: UserProfile | null;
  onBack: () => void;
  onStarsUpdated?: (stars: number) => void;
}

type ExamSubject = 'all' | 'sociales' | 'naturales' | 'lengua' | 'mates';
type ExamLength = 5 | 10;

interface ExamQuestionItem extends GameQuestion {
  points: number;
}

export const ExamSimulatorPage: React.FC<ExamSimulatorPageProps> = ({
  profile,
  onBack,
  onStarsUpdated
}) => {
  // Configuración del examen
  const [selectedSubject, setSelectedSubject] = useState<ExamSubject>('all');
  const [examLength, setExamLength] = useState<ExamLength>(10);
  const [useTimer, setUseTimer] = useState<boolean>(true);
  const [schoolName, setSchoolName] = useState<string>('Colegio Pureza de María (Madrid)');

  // Estado del flujo del examen: 'config' | 'in_progress' | 'results'
  const [examState, setExamState] = useState<'config' | 'in_progress' | 'results'>('config');

  // Preguntas y respuestas del alumno
  const [questions, setQuestions] = useState<ExamQuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputMode, setInputMode] = useState<'buttons' | 'written'>('buttons');

  // Temporizador (en segundos)
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos por defecto
  const [timeSpent, setTimeSpent] = useState(0);

  // Resultados
  const [score, setScore] = useState(0); // sobre 10
  const [correctCount, setCorrectCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [allUnitsExercises, setAllUnitsExercises] = useState<ExerciseItem[]>([]);

  // Cargar ejercicios de todas las unidades del alumno para tener variedad real
  useEffect(() => {
    const loadSchoolExercises = async () => {
      try {
        const units = await fetchUnits();
        const loaded: ExerciseItem[] = [];
        for (const u of units.slice(0, 8)) {
          try {
            const set = await fetchUnit(u.id);
            if (set?.exercises) loaded.push(...set.exercises);
          } catch (e) {}
        }
        setAllUnitsExercises(loaded);
      } catch (e) {
        console.warn('Error cargando ejercicios de la escuela:', e);
      }
    };
    loadSchoolExercises();
  }, []);

  // Generar un examen oficial según los criterios
  const startExam = () => {
    // Filtrar ejercicios de la asignatura si aplica
    let sourcePool = [...allUnitsExercises];
    let factsPool = [...VERIFIED_FACTS];

    if (selectedSubject === 'sociales') {
      factsPool = factsPool.filter(f => f.subject === 'Ciencias Sociales');
    } else if (selectedSubject === 'naturales') {
      factsPool = factsPool.filter(f => f.subject === 'Ciencias Naturales');
    } else if (selectedSubject === 'lengua') {
      factsPool = factsPool.filter(f => f.subject === 'Lengua Castellana');
    } else if (selectedSubject === 'mates') {
      factsPool = factsPool.filter(f => f.subject === 'Matemáticas');
    }

    const rawQuestions = getDynamicGameQuestions(sourcePool, examLength);
    const pointsPerQuestion = Number((10 / examLength).toFixed(2));

    const examItems: ExamQuestionItem[] = rawQuestions.map(q => ({
      ...q,
      points: pointsPerQuestion
    }));

    setQuestions(examItems);
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(examLength === 10 ? 20 * 60 : 10 * 60);
    setTimeSpent(0);
    setExamState('in_progress');
    setShowCelebration(false);
    sounds.playPopSound();
  };

  // Temporizador durante el examen
  useEffect(() => {
    if (examState !== 'in_progress' || !useTimer) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(s => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, useTimer]);

  const selectAnswer = (questionIdx: number, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIdx]: option
    }));
    sounds.playPopSound();
  };

  // Corregir y entregar examen
  const finishExam = () => {
    let earnedPoints = 0;
    let correct = 0;

    questions.forEach((q, idx) => {
      const studentAns = answers[idx] || '';
      const validation = validateWrittenAnswer(studentAns, q.correctAnswer, q.options);
      if (validation.isCorrect) {
        earnedPoints += q.points;
        correct += 1;
      }
    });

    const finalScore = Math.min(10, Math.round(earnedPoints * 10) / 10);
    setScore(finalScore);
    setCorrectCount(correct);
    setExamState('results');

    // Sonidos y estrellas según la nota
    if (finalScore >= 9) {
      sounds.playVictorySound();
      setShowCelebration(true);
      const earnedStars = 10;
      completeStudySession({
        sessionType: 'new',
        durationSeconds: timeSpent,
        totalQuestions: questions.length,
        correctAnswers: correct,
        starsEarned: earnedStars
      }).catch(() => {});
      if (onStarsUpdated && profile) onStarsUpdated(profile.stars + earnedStars);
    } else if (finalScore >= 5) {
      sounds.playMatchSound();
      const earnedStars = 5;
      completeStudySession({
        sessionType: 'new',
        durationSeconds: timeSpent,
        totalQuestions: questions.length,
        correctAnswers: correct,
        starsEarned: earnedStars
      }).catch(() => {});
      if (onStarsUpdated && profile) onStarsUpdated(profile.stars + earnedStars);
    } else {
      sounds.playWobbleSound();
    }
  };

  const getCalificacionLabel = (sc: number) => {
    if (sc >= 9.0) return { label: 'SOBRESALIENTE', color: 'text-emerald-700 bg-emerald-100 border-emerald-400', stamp: '🌟 MATRÍCULA DE HONOR' };
    if (sc >= 7.0) return { label: 'NOTABLE', color: 'text-indigo-700 bg-indigo-100 border-indigo-400', stamp: '👏 MUY BUEN TRABAJO' };
    if (sc >= 6.0) return { label: 'BIEN', color: 'text-blue-700 bg-blue-100 border-blue-400', stamp: '👍 BIEN HECHO' };
    if (sc >= 5.0) return { label: 'SUFICIENTE', color: 'text-amber-800 bg-amber-100 border-amber-400', stamp: '✔️ APROBADO' };
    return { label: 'INSUFICIENTE', color: 'text-rose-700 bg-rose-100 border-rose-400', stamp: '💪 HAY QUE REPASAR' };
  };

  const formatMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==========================================
  // PANTALLA 1: CONFIGURACIÓN DEL EXAMEN
  // ==========================================
  if (examState === 'config') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-800">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-1.5 rounded-2xl text-purple-900 font-black text-sm">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span>Simulador Oficial</span>
          </div>
        </div>

        {/* Portada Institucional */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white p-6 sm:p-8 rounded-4xl shadow-xl border-4 border-indigo-400 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 pointer-events-none">📝</div>
          <div className="max-w-xl space-y-2 text-left">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-black/30 px-3 py-1 rounded-full">
              Modelo Colegios de Madrid • 3.º Primaria
            </span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white drop-shadow">
              Simulador de Exámenes Reales
            </h2>
            <p className="text-sm font-medium text-indigo-100 leading-relaxed">
              Practica con controles oficiales idénticos a los que ponen en clase en el <strong>Colegio Pureza de María</strong> y centros de la Comunidad de Madrid. Calificación oficial sobre 10 con corrección pedagógica inmediata.
            </p>
          </div>
        </div>

        {/* Opciones del Examen */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-6 text-left">
          {/* Asignatura */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
              1. Selecciona la Asignatura o Control:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'all', label: '🌟 Control Global (Mix)', desc: 'Todas las materias' },
                { id: 'sociales', label: '🌍 Ciencias Sociales', desc: 'Relieve, agua, Tierra' },
                { id: 'naturales', label: '🌿 Ciencias Naturales', desc: 'Seres vivos, animales' },
                { id: 'lengua', label: '📖 Lengua Castellana', desc: 'Gramática y ortografía' },
                { id: 'mates', label: '🔢 Matemáticas', desc: 'Cálculo y problemas' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id as ExamSubject)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                    selectedSubject === sub.id
                      ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black block leading-tight text-slate-900">{sub.label}</span>
                  <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">{sub.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Longitud del Examen */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
              2. Formato del Examen:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setExamLength(10)}
                className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                  examLength === 10
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-2xl">📋</span>
                <div>
                  <span className="text-sm font-black text-slate-900 block">Examen Trimestral Oficial (10 Preguntas)</span>
                  <span className="text-xs text-slate-500 font-medium">Nota oficial de 0 a 10 puntos (1 punto por pregunta).</span>
                </div>
              </button>

              <button
                onClick={() => setExamLength(5)}
                className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                  examLength === 5
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-2xl">⚡</span>
                <div>
                  <span className="text-sm font-black text-slate-900 block">Control Rápido de Unidad (5 Preguntas)</span>
                  <span className="text-xs text-slate-500 font-medium">Ideal para un repaso ágil de 10 minutos (2 puntos por pregunta).</span>
                </div>
              </button>
            </div>
          </div>

          {/* Temporizador */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-900 block">Temporizador de Examen</span>
                <span className="text-[11px] text-slate-500 font-medium">Simula el tiempo real de clase con cuenta atrás.</span>
              </div>
            </div>

            <button
              onClick={() => setUseTimer(t => !t)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                useTimer
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {useTimer ? 'Activado (20 min)' : 'Desactivado (Sin prisa)'}
            </button>
          </div>
        </div>

        {/* Botón de Inicio */}
        <button
          onClick={startExam}
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base sm:text-lg shadow-xl shadow-indigo-200 border-2 border-indigo-400 active:scale-98 transition-all flex items-center justify-center gap-3"
        >
          <FileText className="w-6 h-6" />
          <span>Comenzar Examen Oficial</span>
        </button>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 2: EXAMEN EN CURSO (HOJA ESCOLAR)
  // ==========================================
  if (examState === 'in_progress') {
    const currentQ = questions[currentIdx];
    const isAnswered = answers[currentIdx] !== undefined;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 space-y-4 select-none animate-fade-in text-slate-800">
        {/* Barra Superior con Temporizador y Entrega */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que quieres salir del examen? Se perderán las respuestas no entregadas.')) {
                setExamState('config');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Abandonar</span>
          </button>

          {useTimer && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl font-black text-xs sm:text-sm border shadow-sm ${
              timeLeft < 180 ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Tiempo: {formatMinutes(timeLeft)}</span>
            </div>
          )}

          <button
            onClick={finishExam}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Entregar Examen</span>
          </button>
        </div>

        {/* NAVEGADOR DE PREGUNTAS (1 A 10) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                i === currentIdx
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105 shadow-md'
                  : answers[i] !== undefined
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* HOJA DE EXAMEN ESCOLAR (DISEÑO OFICIAL DE COLEGIO) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-3 border-slate-300 shadow-xl space-y-5 text-left relative overflow-hidden">
          {/* Membrete del Colegio */}
          <div className="border-b-2 border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              <span className="font-black text-indigo-900 block text-sm sm:text-base">
                {schoolName}
              </span>
              <span className="font-bold text-slate-500">
                Control Oficial de Evaluación • 3.º Educación Primaria
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-bold">
              <span>Alumna: </span>
              <strong className="text-slate-900">{profile?.name || 'Samantha'}</strong>
            </div>
          </div>

          {/* Enunciado de la Pregunta */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full">
                Ejercicio {currentIdx + 1} de {questions.length} • {currentQ.topic} ({currentQ.points} ptos)
              </span>

              <div className="flex items-center gap-2">
                {/* Selector Opciones vs Escribir */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setInputMode('buttons')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
                      inputMode === 'buttons'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>Opciones</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('written')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
                      inputMode === 'written'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PenLine className="w-3 h-3" />
                    <span>Escribir ✍️</span>
                  </button>
                </div>

                <SpeechButton text={currentQ.question} size="sm" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* MODO 1: Opciones de Respuesta Marcables */}
          {inputMode === 'buttons' ? (
            <div className="space-y-2.5 pt-1">
              {currentQ.options.map((opt, oIdx) => {
                const letter = String.fromCharCode(65 + oIdx);
                const isSelected = answers[currentIdx] === opt;

                return (
                  <button
                    key={oIdx}
                    onClick={() => selectAnswer(currentIdx, opt)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-black shadow-md ring-2 ring-indigo-200'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 font-semibold'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* MODO 2: Respuesta Redactada en Líneas Escolares */
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">
                Escribe tu respuesta a mano o con el teclado:
              </label>
              <input
                type="text"
                value={answers[currentIdx] || ''}
                onChange={e => {
                  setAnswers(prev => ({ ...prev, [currentIdx]: e.target.value }));
                }}
                placeholder="Escribe aquí tu respuesta..."
                className="w-full p-4 text-base sm:text-lg font-bold rounded-2xl border-2 border-indigo-300 bg-amber-50/40 text-slate-900 shadow-inner outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1 italic">
                * Corrección automática con tolerancia a mayúsculas y acentos.
              </p>
            </div>
          )}

          {/* Pie de la Hoja con Botones Anterior / Siguiente */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-xs font-bold text-slate-400">
              {answeredCount} de {questions.length} respondidas
            </span>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finishExam}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Revisar y Entregar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 3: BOLETÍN OFICIAL DE RESULTADOS
  // ==========================================
  const calif = getCalificacionLabel(score);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 select-none animate-fade-in text-slate-800">
      {showCelebration && <ConfettiCelebration />}

      {/* Barra de Acciones */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setExamState('config')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Nuevo Examen</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / PDF</span>
        </button>
      </div>

      {/* BOLETÍN OFICIAL ESCOLAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-slate-300 shadow-2xl space-y-6 text-left relative overflow-hidden print:border-none print:shadow-none">
        {/* Cabecera del Boletín */}
        <div className="border-b-2 border-slate-300 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
              Comunidad de Madrid • Educación Primaria
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {schoolName}
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              Boletín de Evaluación Oficial • Alumna: <strong>{profile?.name || 'Samantha'}</strong>
            </p>
          </div>

          {/* Sello de Calificación Oficial */}
          <div className={`p-4 rounded-3xl border-3 flex flex-col items-center justify-center min-w-[130px] shadow-lg ${calif.color}`}>
            <span className="text-[10px] font-black uppercase tracking-wider">{calif.stamp}</span>
            <span className="text-3xl sm:text-4xl font-black mt-0.5">{score.toFixed(1)}</span>
            <span className="text-[11px] font-black uppercase">sobre 10</span>
          </div>
        </div>

        {/* Resumen de Desempeño */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
            <span className="text-xs text-emerald-800 font-bold block">Aciertos</span>
            <span className="text-xl font-black text-emerald-900">{correctCount} de {questions.length}</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl">
            <span className="text-xs text-rose-800 font-bold block">Fallos</span>
            <span className="text-xl font-black text-rose-900">{questions.length - correctCount}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl">
            <span className="text-xs text-amber-800 font-bold block">Premio</span>
            <span className="text-xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{score >= 9 ? '+10' : score >= 5 ? '+5' : '+2'}</span>
            </span>
          </div>
        </div>

        {/* DESGLOSE PREGUNTA POR PREGUNTA (CORRECCIÓN DETALLADA) */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Corrección Detallada del Examen:</span>
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const studentAns = answers[idx];
              const isCorrect = studentAns === q.correctAnswer;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-2 text-left space-y-2 ${
                    isCorrect
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-rose-50/70 border-rose-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <span className="text-xs font-black text-slate-800">
                        Ejercicio {idx + 1}: {q.question}
                      </span>
                    </div>

                    <span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${
                      isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {isCorrect ? `+${q.points} ptos` : '0 ptos'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 pl-7">
                    <p className="font-semibold text-slate-700">
                      <span>Tu respuesta: </span>
                      <strong className={isCorrect ? 'text-emerald-800' : 'text-rose-800 line-through'}>
                        {studentAns || '(Sin responder)'}
                      </strong>
                    </p>

                    {!isCorrect && (
                      <p className="font-bold text-emerald-800">
                        <span>Respuesta correcta: </span>
                        <span>{q.correctAnswer}</span>
                      </p>
                    )}

                    <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-xl border border-slate-200">
                      💡 <strong>Explicación:</strong> {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones al pie del boletín */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setExamState('config')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm active:scale-95 shadow-md shadow-indigo-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Simular Otro Examen (Preguntas Nuevas)</span>
          </button>

          <button
            onClick={onBack}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};
