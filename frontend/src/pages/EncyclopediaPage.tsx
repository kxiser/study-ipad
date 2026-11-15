import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Compass,
  GraduationCap,
  Star,
  Play,
  FileCheck2,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  fetchCuratedTopics,
  searchEncyclopedia,
  generateUnitFromTopic,
  CuratedTopicItem,
  EncyclopediaSearchResult
} from '../services/api.js';
import { ExerciseSet } from '../types.js';
import { Mascot } from '../components/Mascot.js';
import { getSelectedCharacter } from '../utils/characters.js';
import { sounds } from '../utils/soundEffects.js';

interface EncyclopediaPageProps {
  onBack: () => void;
  onUnitCreated: (unitId: string, set: ExerciseSet) => void;
  mascotType?: string;
}

export const EncyclopediaPage: React.FC<EncyclopediaPageProps> = ({
  onBack,
  onUnitCreated,
  mascotType = 'chispa'
}) => {
  const [selectedAge, setSelectedAge] = useState<number>(8); // Samantha = 8 años (3.º Primaria)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<EncyclopediaSearchResult[] | null>(null);
  const [curatedTopics, setCuratedTopics] = useState<CuratedTopicItem[]>([]);
  const [isLoadingCurated, setIsLoadingCurated] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingTopic, setGeneratingTopic] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hero = getSelectedCharacter();

  // Cargar temas curados al cambiar la edad seleccionada
  useEffect(() => {
    setIsLoadingCurated(true);
    fetchCuratedTopics(selectedAge)
      .then(topics => {
        setCuratedTopics(topics);
        setIsLoadingCurated(false);
      })
      .catch(() => setIsLoadingCurated(false));
  }, [selectedAge]);

  // Manejar búsqueda en Vikidia infantil
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    try {
      sounds.playFlipSound();
      const results = await searchEncyclopedia(query, selectedAge);
      setSearchResults(results);
      if (results.length === 0) {
        setErrorMessage(`No encontramos resultados para "${query}". ¡Prueba con otra palabra o elige un tema recomendado!`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al buscar en la enciclopedia.');
    } finally {
      setIsSearching(false);
    }
  };

  // Crear la unidad con IA y comenzar a jugar
  const handleGenerateUnit = async (topicTitle: string, context?: string, subjectHint?: string) => {
    setIsGenerating(true);
    setGeneratingTopic(topicTitle);
    setErrorMessage(null);
    try {
      sounds.playPopSound();
      const result = await generateUnitFromTopic({
        topic: topicTitle,
        age: selectedAge,
        encyclopediaContext: context,
        subjectHint
      });

      sounds.playVictorySound();
      onUnitCreated(result.unitId, result.exerciseSet);
    } catch (err: any) {
      sounds.playWobbleSound();
      setErrorMessage(err.message || 'Error al crear la unidad interactiva.');
      setIsGenerating(false);
      setGeneratingTopic(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fade-in select-none">
      {/* Barra superior con volver y héroe */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 font-extrabold hover:text-magic-600 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Inicio</span>
        </button>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border-2 border-magic-200 shadow-sm text-xs font-black text-slate-700">
          <span className="text-lg">{hero.emoji}</span>
          <span>{hero.name} explorando</span>
        </div>
      </div>

      {/* Cabecera del Buscador Enciclopédico */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Compass className="w-6 h-6 text-white" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Vikidia & Enciclopedia Infantil
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black">
            Descubre y Aprende Cualquier Tema
          </h2>
          <p className="text-blue-100 text-sm md:text-base font-semibold">
            Conectado a <strong>Vikidia</strong> (la enciclopedia libre para niños de 8 a 13 años). Escribe lo que quieras aprender y crearemos juegos a tu medida.
          </p>
        </div>

        {/* Selector de Rango de Edad */}
        <div className="pt-2">
          <label className="text-xs font-black text-blue-200 uppercase tracking-wider block mb-2">
            Selecciona tu edad o curso escolar:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedAge(7)}
              className={`p-3 rounded-2xl font-black text-xs md:text-sm flex flex-col items-center gap-1 transition-all ${
                selectedAge <= 7
                  ? 'bg-white text-indigo-900 shadow-lg scale-102 ring-2 ring-white'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span className="text-xl">🐣</span>
              <span>6 - 7 años</span>
              <span className="text-[10px] opacity-80">1.º y 2.º Primaria</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAge(8)}
              className={`p-3 rounded-2xl font-black text-xs md:text-sm flex flex-col items-center gap-1 transition-all ${
                selectedAge === 8 || selectedAge === 9
                  ? 'bg-white text-indigo-900 shadow-lg scale-102 ring-2 ring-white'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span className="text-xl">🌟</span>
              <span>8 - 9 años</span>
              <span className="text-[10px] opacity-80">Samantha (3.º Primaria)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAge(11)}
              className={`p-3 rounded-2xl font-black text-xs md:text-sm flex flex-col items-center gap-1 transition-all ${
                selectedAge >= 10
                  ? 'bg-white text-indigo-900 shadow-lg scale-102 ring-2 ring-white'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span className="text-xl">🚀</span>
              <span>10 - 12 años</span>
              <span className="text-[10px] opacity-80">5.º y 6.º Primaria</span>
            </button>
          </div>
        </div>

        {/* Barra de Búsqueda Interactiva */}
        <form onSubmit={handleSearch} className="relative pt-2">
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-inner">
            <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escribe un tema (ej: volcanes, dinosaurios, el sol, castillos...)"
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 font-bold text-sm md:text-base outline-none px-2"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                }}
                className="text-slate-400 hover:text-slate-600 px-2 font-black text-xs"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 bg-magic-600 hover:bg-magic-700 text-white rounded-xl font-black text-xs md:text-sm shadow-md active:scale-95 transition-all shrink-0 disabled:opacity-50"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {/* Chips de Búsqueda Rápida */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none text-xs">
          <span className="text-blue-200 font-bold shrink-0">Populares:</span>
          {['🌋 Volcanes', '🪐 Planetas', '🦖 Dinosaurios', '🏰 Castillos', '🌊 Océanos', '🏛️ Romanos', '🫀 El Cuerpo'].map((chip) => {
            const rawWord = chip.split(' ')[1];
            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setSearchQuery(rawWord);
                  setIsSearching(true);
                  searchEncyclopedia(rawWord, selectedAge).then(res => {
                    setSearchResults(res);
                    setIsSearching(false);
                  });
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full font-bold whitespace-nowrap active:scale-95 transition-all"
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mensajes de Error si los hay */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-bold">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Resultados de Búsqueda en Vikidia */}
      {searchResults !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>Resultados de la Enciclopedia para "{searchQuery}"</span>
              <span className="text-xs bg-magic-100 text-magic-700 font-black px-2.5 py-0.5 rounded-full">
                {searchResults.length} encontrados
              </span>
            </h3>

            <button
              type="button"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
              className="text-xs font-black text-slate-500 hover:text-magic-600 underline"
            >
              Volver a Temas Recomendados
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 shadow-md border-2 border-magic-100 hover:border-magic-400 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-magic-600 bg-magic-50 border border-magic-200 px-2.5 py-0.5 rounded-full">
                        {item.source}
                      </span>
                      <h4 className="text-lg font-black text-slate-800 mt-1">
                        {item.title}
                      </h4>
                    </div>

                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
                      />
                    )}
                  </div>

                  <p className="text-slate-600 text-xs md:text-sm font-medium line-clamp-3">
                    {item.extract || 'Información didáctica adaptada para niños.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <span>Leer en Vikidia</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleGenerateUnit(item.title, item.extract)}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-xl bg-magic-600 hover:bg-magic-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-magic-200 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>¡Crear Juegos y Estudiar!</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catálogo de Temas Curados Recomendados por Edad */}
      {searchResults === null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800">
                Temas Recomendados para {selectedAge <= 7 ? '6-7 años' : selectedAge <= 9 ? '8-9 años (Samantha)' : '10-12 años'}
              </h3>
              <p className="text-xs md:text-sm font-bold text-slate-500">
                Seleccionados según los programas educativos de Primaria en Madrid.
              </p>
            </div>

            <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              ✨ 100% Gratis
            </span>
          </div>

          {isLoadingCurated ? (
            <div className="py-12 text-center">
              <Mascot mascotType={mascotType} mood="thinking" size="md" message="Preparando temas educativos..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {curatedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-3xl p-5 shadow-md border-2 border-slate-100 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-3 py-1 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                        {topic.subject}
                      </span>
                      <span className="text-xs font-black text-slate-400">
                        {topic.ageRange}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="text-3xl p-2 bg-indigo-50 rounded-2xl shrink-0">
                        {topic.emoji}
                      </span>
                      <div>
                        <h4 className="text-lg font-black text-slate-800 leading-snug">
                          {topic.title}
                        </h4>
                        <p className="text-slate-600 text-xs md:text-sm font-medium mt-1">
                          {topic.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <span>Etiquetas: {topic.tags.join(', ')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateUnit(topic.title, topic.summary, topic.subject)}
                      disabled={isGenerating}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 fill-white" />
                      <span>¡Aprender este tema!</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal flotante de generación con Chispa */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl border-4 border-magic-400 animate-scale-up">
            <span className="text-6xl block animate-bounce">{hero.emoji}</span>
            <h3 className="text-2xl font-black text-slate-800">
              {hero.name} está creando tu tema
            </h3>
            <p className="text-sm font-bold text-magic-600">
              "{generatingTopic}"
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              Consultando la enciclopedia y adaptando ejercicios divertidos para {selectedAge} años con minijuegos y preguntas interactivas...
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-magic-500 to-indigo-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
