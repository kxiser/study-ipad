import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAIProvider } from '../providers/index.js';
import { saveExerciseSet } from '../db/database.js';

interface CuratedTopic {
  id: string;
  title: string;
  subject: string;
  emoji: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  summary: string;
  searchQuery: string;
  tags: string[];
}

export const CURATED_TOPICS: CuratedTopic[] = [
  // 6 - 7 AÑOS (1.º y 2.º Primaria)
  {
    id: 'ani-domesticos-6',
    title: 'Animales Domésticos y Salvajes',
    subject: 'Ciencias Naturales',
    emoji: '🐶',
    ageRange: '6 - 7 años',
    minAge: 6,
    maxAge: 7,
    summary: 'Aprende qué animales viven con nosotros en casa o en la granja y cuáles viven libres en la selva o el bosque.',
    searchQuery: 'Animal doméstico',
    tags: ['Animales', 'Naturaleza']
  },
  {
    id: 'estaciones-6',
    title: 'Las Cuatro Estaciones del Año',
    subject: 'Ciencias Naturales',
    emoji: '🍂',
    ageRange: '6 - 7 años',
    minAge: 6,
    maxAge: 7,
    summary: 'Primavera, verano, otoño e invierno. Descubre cómo cambian los árboles, el tiempo y la ropa que usamos.',
    searchQuery: 'Estaciones del año',
    tags: ['Clima', 'Tiempo']
  },
  {
    id: 'sentidos-6',
    title: 'Los Cinco Sentidos',
    subject: 'Ciencias Naturales',
    emoji: '👁️',
    ageRange: '6 - 7 años',
    minAge: 6,
    maxAge: 7,
    summary: 'La vista, el oído, el olfato, el gusto y el tacto. ¿Cómo exploramos las cosas que nos rodean?',
    searchQuery: 'Sentido',
    tags: ['Cuerpo Humano']
  },
  {
    id: 'plantas-semilla-6',
    title: 'Las Plantas y sus Partes',
    subject: 'Ciencias Naturales',
    emoji: '🌱',
    ageRange: '6 - 7 años',
    minAge: 6,
    maxAge: 7,
    summary: 'Raíz, tallo, hojas y flores. Cómo crece una semillita con la luz del Sol y el agua.',
    searchQuery: 'Planta',
    tags: ['Botánica', 'Flores']
  },
  {
    id: 'numeros-sumas-6',
    title: 'Números Divertidos y Sumas',
    subject: 'Matemáticas',
    emoji: '🔢',
    ageRange: '6 - 7 años',
    minAge: 6,
    maxAge: 7,
    summary: 'Contar decenas, amigos del 10 y sumas sencillas para resolver problemas cotidianos.',
    searchQuery: 'Número natural',
    tags: ['Cálculo', 'Matemáticas']
  },

  // 8 - 9 AÑOS (3.º y 4.º Primaria - Nivel Samantha / Pureza de María)
  {
    id: 'volcanes-terremotos-8',
    title: 'Los Volcanes y los Terremotos',
    subject: 'Ciencias Naturales',
    emoji: '🌋',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'Magma, lava, cráteres y el movimiento de las placas tectónicas dentro de nuestro planeta Tierra.',
    searchQuery: 'Volcán',
    tags: ['Geología', 'Tierra']
  },
  {
    id: 'sistema-solar-8',
    title: 'El Sistema Solar y los Planetas',
    subject: 'Ciencias Naturales',
    emoji: '🪐',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'El Sol, los planetas rocosos y gaseosos, la Luna y los viajes espaciales de los astronautas.',
    searchQuery: 'Sistema solar',
    tags: ['Espacio', 'Astronomía']
  },
  {
    id: 'dinosaurios-fosiles-8',
    title: 'Los Dinosaurios y los Fósiles',
    subject: 'Ciencias Naturales',
    emoji: '🦖',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'Herbívoros gigantes, carnívoros temibles como el T-Rex y cómo los paleontólogos descubren fósiles.',
    searchQuery: 'Dinosauria',
    tags: ['Prehistoria', 'Fósiles']
  },
  {
    id: 'edad-media-castillos-8',
    title: 'La Edad Media, Caballeros y Castillos',
    subject: 'Ciencias Sociales',
    emoji: '🏰',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'Cómo vivían en los castillos medievales, los caballeros con armaduras, reyes y aldeas.',
    searchQuery: 'Edad Media',
    tags: ['Historia', 'Castillos']
  },
  {
    id: 'oceanos-arrecifes-8',
    title: 'El Fondo del Océano y los Arrecifes',
    subject: 'Ciencias Naturales',
    emoji: '🌊',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'Delfines, ballenas, arrecifes de coral de colores y las misteriosas profundidades marinas.',
    searchQuery: 'Océano',
    tags: ['Mar', 'Ecología']
  },
  {
    id: 'romanos-hispania-8',
    title: 'Los Romanos y sus Monumentos',
    subject: 'Ciencias Sociales',
    emoji: '🏛️',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'Los acueductos como el de Segovia, calzadas romanas, teatros y gladiadores en la Hispania romana.',
    searchQuery: 'Hispania romana',
    tags: ['Historia', 'Monumentos']
  },
  {
    id: 'cuerpo-huesos-musculos-8',
    title: 'El Cuerpo Humano: Huesos y Músculos',
    subject: 'Ciencias Naturales',
    emoji: '🫀',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'El esqueleto humano con más de 200 huesos, articulaciones y músculos para movernos con fuerza.',
    searchQuery: 'Esqueleto humano',
    tags: ['Anatomía', 'Salud']
  },
  {
    id: 'electricidad-imanes-8',
    title: 'La Electricidad y el Magnetismo',
    subject: 'Ciencias Naturales',
    emoji: '⚡',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'Cargas eléctricas, circuitos sencillos, conductores, aislantes y la magia de los polos de un imán.',
    searchQuery: 'Electricidad',
    tags: ['Física', 'Experimentos']
  },
  {
    id: 'multiplicaciones-problemas-8',
    title: 'Retos de Multiplicar y Estrategias',
    subject: 'Matemáticas',
    emoji: '📐',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'Problemas de ingenio, dobles y triples, y trucos para dominar las tablas sin aburrirse.',
    searchQuery: 'Multiplicación',
    tags: ['Matemáticas', 'Lógica']
  },
  {
    id: 'ortografia-sinonimos-8',
    title: 'Aventuras con las Palabras y Ortografía',
    subject: 'Lengua Castellana',
    emoji: '✍️',
    ageRange: '8 - 9 años',
    minAge: 8,
    maxAge: 9,
    summary: 'Sinónimos divertidos, antónimos, palabras agudas, llanas y reglas de la B y la V.',
    searchQuery: 'Ortografía',
    tags: ['Lengua', 'Gramática']
  },

  // 10 - 12 AÑOS (5.º y 6.º Primaria)
  {
    id: 'celulas-adn-10',
    title: 'La Célula y los Seres Microscópicos',
    subject: 'Ciencias Naturales',
    emoji: '🔬',
    ageRange: '10 - 12 años',
    minAge: 10,
    maxAge: 12,
    summary: 'La unidad básica de toda vida: membrana, citoplasma y núcleo celular. Microscopios y bacterias.',
    searchQuery: 'Célula',
    tags: ['Biología', 'Ciencia']
  },
  {
    id: 'antiguo-egipto-10',
    title: 'El Antiguo Egipto y las Pirámides',
    subject: 'Ciencias Sociales',
    emoji: '🇪🇬',
    ageRange: '10 - 12 años',
    minAge: 10,
    maxAge: 12,
    summary: 'El río Nilo, los faraones Tutankamón y Ramsés, jeroglíficos y la construcción de las pirámides.',
    searchQuery: 'Antiguo Egipto',
    tags: ['Historia', 'Arqueología']
  },
  {
    id: 'antigua-grecia-10',
    title: 'La Antigua Grecia y los Juegos Olímpicos',
    subject: 'Ciencias Sociales',
    emoji: '🏛️',
    ageRange: '10 - 12 años',
    minAge: 10,
    maxAge: 12,
    summary: 'Atenas, Esparta, mitología de los dioses del Olimpo y el nacimiento de la democracia.',
    searchQuery: 'Antigua Grecia',
    tags: ['Historia', 'Mitología']
  },
  {
    id: 'energia-clima-10',
    title: 'Energías Renovables y el Clima',
    subject: 'Ciencias Naturales',
    emoji: '🌍',
    ageRange: '10 - 12 años',
    minAge: 10,
    maxAge: 12,
    summary: 'Energía solar, eólica, el efecto invernadero y cómo cuidar los ecosistemas del planeta.',
    searchQuery: 'Energía renovable',
    tags: ['Ecología', 'Medio Ambiente']
  },
  {
    id: 'fracciones-porcentajes-10',
    title: 'Fracciones, Porcentajes y Proporciones',
    subject: 'Matemáticas',
    emoji: '🍕',
    ageRange: '10 - 12 años',
    minAge: 10,
    maxAge: 12,
    summary: 'Partes de la unidad, sumas de fracciones con pizza y cálculo de descuentos porcentuales.',
    searchQuery: 'Fracción',
    tags: ['Matemáticas', 'Fracciones']
  }
];

function cleanSnippet(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export async function encyclopediaRoutes(fastify: FastifyInstance) {
  // 1. Obtener temas curados por rango de edad
  fastify.get('/api/encyclopedia/curated', async (req: FastifyRequest, reply: FastifyReply) => {
    const { age } = req.query as { age?: string };
    const targetAge = age ? parseInt(age, 10) : 8;

    let topics = CURATED_TOPICS;
    if (targetAge <= 7) {
      topics = CURATED_TOPICS.filter(t => t.maxAge <= 7);
    } else if (targetAge <= 9) {
      topics = CURATED_TOPICS.filter(t => t.minAge <= 9 && t.maxAge >= 8);
    } else {
      topics = CURATED_TOPICS.filter(t => t.minAge >= 10);
    }

    return reply.send({
      targetAge,
      topics
    });
  });

  // 2. Búsqueda en Vikidia Infantil (con fallback en Wikipedia)
  fastify.get('/api/encyclopedia/search', async (req: FastifyRequest, reply: FastifyReply) => {
    const { query, age } = req.query as { query?: string; age?: string };
    const term = (query || '').trim();

    if (!term) {
      return reply.status(400).send({ error: 'Debes proporcionar un término de búsqueda (ej: volcan, planetas, dinosaurios).' });
    }

    const targetAge = age ? parseInt(age, 10) : 8;

    try {
      // 1. Buscar en Vikidia (enciclopedia escrita especialmente para niños de 8 a 13 años)
      const searchUrl = `https://es.vikidia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        term
      )}&utf8=1&format=json`;

      const vikidiaRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'StudyIpad/2.0 (educational app for children; contact: dev@studyipad.local)' }
      });

      let items: any[] = [];

      if (vikidiaRes.ok) {
        const searchJson: any = await vikidiaRes.json();
        const searchResults: any[] = searchJson.query?.search || [];

        if (searchResults.length > 0) {
          const topResults = searchResults.slice(0, 6);
          const titles = topResults.map(r => r.title).join('|');

          // Obtener extractos e imágenes de Vikidia
          const detailUrl = `https://es.vikidia.org/w/api.php?action=query&prop=extracts|pageimages&pithumbsize=500&exintro=1&explaintext=1&titles=${encodeURIComponent(
            titles
          )}&utf8=1&format=json`;

          const detailRes = await fetch(detailUrl, {
            headers: { 'User-Agent': 'StudyIpad/2.0 (educational app)' }
          });

          if (detailRes.ok) {
            const detailJson: any = await detailRes.json();
            const pagesObj = detailJson.query?.pages || {};

            items = Object.values(pagesObj)
              .filter((p: any) => p && p.title && !p.missing)
              .map((p: any) => ({
                id: `vikidia-${p.pageid || p.title}`,
                title: p.title,
                extract: (p.extract || '').trim(),
                thumbnail: p.thumbnail?.source || null,
                source: 'Vikidia (Enciclopedia Infantil)',
                sourceUrl: `https://es.vikidia.org/wiki/${encodeURIComponent(p.title)}`,
                suggestedAge: targetAge
              }));
          }
        }
      }

      // Si Vikidia devolvió pocos o ningún resultado, buscar en Wikipedia en Español
      if (items.length < 2) {
        try {
          const wikiSearchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
            term
          )}&utf8=1&format=json`;

          const wikiRes = await fetch(wikiSearchUrl, {
            headers: { 'User-Agent': 'StudyIpad/2.0 (educational app)' }
          });

          if (wikiRes.ok) {
            const wikiJson: any = await wikiRes.json();
            const wikiResults: any[] = wikiJson.query?.search || [];

            if (wikiResults.length > 0) {
              const topWiki = wikiResults.slice(0, 4);
              const wikiTitles = topWiki.map(r => r.title).join('|');

              const wikiDetailUrl = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&pithumbsize=500&exintro=1&explaintext=1&titles=${encodeURIComponent(
                wikiTitles
              )}&utf8=1&format=json`;

              const detailRes = await fetch(wikiDetailUrl, {
                headers: { 'User-Agent': 'StudyIpad/2.0 (educational app)' }
              });

              if (detailRes.ok) {
                const detailJson: any = await detailRes.json();
                const pagesObj = detailJson.query?.pages || {};

                const wikiItems = Object.values(pagesObj)
                  .filter((p: any) => p && p.title && !p.missing)
                  .map((p: any) => ({
                    id: `wiki-${p.pageid || p.title}`,
                    title: p.title,
                    extract: (p.extract || '').trim(),
                    thumbnail: p.thumbnail?.source || null,
                    source: 'Wikipedia',
                    sourceUrl: `https://es.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
                    suggestedAge: targetAge
                  }));

                // Combinar evitando títulos repetidos
                const existingTitles = new Set(items.map(i => i.title.toLowerCase()));
                for (const wi of wikiItems) {
                  if (!existingTitles.has(wi.title.toLowerCase())) {
                    items.push(wi);
                  }
                }
              }
            }
          }
        } catch (wikiErr) {
          req.log.warn({ err: wikiErr }, 'Wikipedia fallback search error');
        }
      }

      return reply.send({
        query: term,
        age: targetAge,
        count: items.length,
        results: items
      });
    } catch (err: any) {
      req.log.error(err, 'Error consultando enciclopedia');
      return reply.status(500).send({
        error: 'No pudimos consultar la enciclopedia en este momento. Inténtalo de nuevo.'
      });
    }
  });

  // 3. Generar unidad didáctica interactiva a partir de tema enciclopédico
  fastify.post('/api/encyclopedia/generate', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = (req.body as any) || {};
    const { topic, age, encyclopediaContext, subjectHint, userId } = body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return reply.status(400).send({ error: 'Debes indicar el tema que deseas estudiar.' });
    }

    const targetAge = typeof age === 'number' ? age : parseInt(age, 10) || 8;
    const targetUserId = userId || (req.headers['x-user-id'] as string) || 'user-samantha';

    try {
      const provider = getAIProvider();
      req.log.info(`[Encyclopedia Generate] Creando tema "${topic}" para edad ${targetAge} con ${provider.name}`);

      let exerciseSet;
      if (typeof provider.generateExercisesFromTopic === 'function') {
        exerciseSet = await provider.generateExercisesFromTopic({
          topic: topic.trim(),
          ageYears: targetAge,
          encyclopediaContext: encyclopediaContext ? String(encyclopediaContext) : undefined,
          subjectHint: subjectHint ? String(subjectHint) : undefined
        });
      } else {
        // Fallback a generación estándar si el provider no soporta topic
        exerciseSet = await provider.generateExercisesFromImages([], subjectHint);
      }

      const unitId = 'unit-enc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
      saveExerciseSet(unitId, exerciseSet, targetUserId);

      return reply.status(201).send({
        unitId,
        exerciseSet
      });
    } catch (err: any) {
      req.log.error(err, 'Error generando unidad didáctica desde la enciclopedia');
      return reply.status(500).send({
        error: 'No se pudo generar la actividad interactiva: ' + (err.message || 'Error desconocido')
      });
    }
  });
}
