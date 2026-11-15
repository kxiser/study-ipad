# 📚 Mi Cuaderno Mágico (PWA para iPad)

Una aplicación web progresiva (**PWA**) diseñada específicamente para que una **niña de 8 años (3º de Primaria)** estudie de forma interactiva y autónoma desde su **iPad**.

---

## 💡 ¿Se puede hacer sin IA o 100% GRATIS?

**Sí. Tienes 4 alternativas según tus recursos:**

| Opción | Coste | Conexión | Privacidad | Calidad Pedagógica |
| :--- | :--- | :--- | :--- | :--- |
| **1. Ollama Local (`llama3.2-vision`)** | **100% GRATIS** | Red local de casa | 100% en tu máquina | Muy buena |
| **2. Google Gemini Flash (`gemini-1.5-flash`)** | **100% GRATIS** (Free Tier: 15 req/min) | Requiere Internet | Servidor Google | Excelente |
| **3. Claude Sonnet 3.5 (`claude-3-5-sonnet`)** | ~0.005$ - 0.01$ por página | Requiere Internet | Servidor Anthropic | Máxima precisión en español |
| **4. Modo Demo / Offline (`mock`)** | **100% GRATIS** | Sin Internet | 100% local | Plantillas preconfiguradas |

> **Recomendación para gasto cero:**
> - Si tienes un ordenador en casa (Mac M1/M2/M3 o PC con tarjeta gráfica decente): usa **Ollama local** con `docker-compose.local.yml`. Coste $0 y sin enviar nada a internet.
> - Si no tienes un ordenador potente: usa **Google Gemini Flash** obteniendo una clave API gratuita en [Google AI Studio](https://aistudio.google.com/). Es **100% gratis** (su capa gratuita permite 15 páginas por minuto, más que suficiente para una niña estudiando).

---

## ✨ Características Principales

### 1. Flujo Fotográfico para iPad
- **Captura directa**: usa `<input type="file" accept="image/*" capture="environment" multiple />` para abrir directamente la cámara del iPad o elegir del carrete.
- **Compresión en el navegador**: las fotos tomadas con la cámara del iPad de 12 MP (~10 MB) se comprimen en cliente con Canvas a ~300 KB antes de subirse. Sube en un segundo incluso con Wi-Fi débil.
- **Privacidad total**: **las fotos nunca se guardan en disco**. Se procesan en la memoria RAM temporal para generar los ejercicios en JSON y se liberan de inmediato.

### 2. 6 Tipos de Ejercicios Interactivos (Nivel 8 Años)
1. **Opción múltiple (Quiz)**: 3 o 4 opciones grandes y coloridas con feedback inmediato.
2. **Verdadero / Falso**: dos botones gigantes con pulgar arriba 👍 y abajo 👎.
3. **Completar huecos (Fill in the blank)**: oración con un hueco `[ ? ]` y fichas de palabras clicables con el dedo.
4. **Ordenar pasos o frases**: fichas con botones grandes de flechas ▲ y ▼ para ordenar la secuencia fácilmente en pantalla táctil de iPad.
5. **Unir con parejas (Matching)**: dos columnas táctiles para emparejar conceptos con colores.
6. **Tarjetas de repaso (Flashcards)**: giro 3D táctil con truco para recordar y autoevaluación.

### 3. Pedagógico y Estimulante
- **Sesiones cortas (5 a 10 min)**, una pregunta por pantalla.
- **Web Speech API (Altavoz 🔊)**: el iPad lee el enunciado en español para facilitar la comprensión lectora.
- **Mascota amigable**: "Chispa el Zorro" o "Búho Sabio", que acompaña con frases cariñosas ("¡Tú puedes!", "¡Genial!", "¡Casi, de los errores se aprende!").
- **Gamificación suave sin presión**: estrellas coleccionables ⭐, racha de días seguidos 🔥 y confeti en los aciertos.
- **Repetición espaciada (SRS)**: lo fallado vuelve a programarse para mañana de forma suave para afianzar en la memoria a largo plazo.

### 4. Soporte Offline y PWA
- Service Worker que cachea los assets estáticos y las unidades de estudio descargadas.
- Si el iPad pierde el Wi-Fi, la niña puede seguir haciendo sus repasos pendientes. Las respuestas se sincronizan automáticamente con SQLite en cuanto vuelve la conexión.
- Botón de escaneo con detección offline amigable.

---

## 🛠️ Stack Tecnológico

- **Frontend**: TypeScript, React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Vite PWA (Workbox).
- **Backend**: Node.js 20, Fastify, TypeScript, `@fastify/multipart`, `@fastify/cors`.
- **Base de Datos**: SQLite con `better-sqlite3` (WAL mode activado para alta concurrencia).
- **Validación**: `zod` con reintento automático si el LLM devuelve formato inválido.
- **Proxy & SSL**: Caddy (HTTPS automático con Let's Encrypt para VPS).
- **Testing**: Vitest (tests de esquemas Zod, repetición espaciada SRS y endpoints de Fastify).

---

## 🚀 Despliegue Paso a Paso

### 🅰️ MODO 1: Despliegue en VPS (Producción con Dominio y HTTPS Automático)

Caddy gestionará los certificados SSL Let's Encrypt automáticamente:

1. Clona el repositorio en tu servidor VPS:
   ```bash
   git clone <tu-repositorio> study
   cd study
   ```

2. Configura el archivo `.env`:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Configura tu dominio y tu proveedor de IA favorito:
   ```env
   DOMAIN=estudio.tudominio.com
   PIN_CODE=1234
   AI_PROVIDER=gemini   # o claude
   GEMINI_API_KEY=AIzaSy...
   ```

3. Levanta los contenedores:
   ```bash
   docker compose up -d --build
   ```

4. ¡Listo! Abre `https://estudio.tudominio.com` en el iPad.

---

### 🅱️ MODO 2: Modo Local en la Red Wi-Fi de Casa (100% GRATIS con Ollama)

Ideal para correrlo en tu ordenador de casa sin gastar un céntimo:

1. Configura el archivo `.env`:
   ```bash
   cp .env.example .env
   ```
   Asegúrate de que tenga:
   ```env
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://ollama:11434
   OLLAMA_MODEL=llama3.2-vision
   PIN_CODE=1234
   ```

2. Levanta con el docker-compose local:
   ```bash
   docker compose -f docker-compose.local.yml up -d --build
   ```

3. Descarga el modelo de visión en Ollama (solo la primera vez):
   ```bash
   docker exec -it study-ollama-local ollama pull llama3.2-vision
   ```

4. Mira la IP local de tu ordenador en la red Wi-Fi (ej: `192.168.1.45`):
   - En Mac: `ipconfig getifaddr en0`
   - En Linux: `hostname -I`
   - En Windows: `ipconfig`

5. En el iPad, abre Safari y navega a:
   ```
   http://192.168.1.45
   ```

---

### 💻 MODO 3: Ejecución en Desarrollo (Sin Docker)

Si quieres ejecutarlo en tu ordenador para desarrollo rápido:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run build
   # Crea un .env en backend/.env o en la raíz
   npm run dev
   ```
   El backend arrancará en `http://localhost:4000`.

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   El frontend arrancará en `http://localhost:5173`.

3. **Ejecutar Tests**:
   ```bash
   cd backend
   npm test
   ```

---

## 📱 Cómo Instalar la App en el iPad (PWA a Pantalla Completa)

Para que la niña tenga una experiencia idéntica a una app nativa descargada de la App Store:

1. Abre la web en **Safari** en el iPad.
2. Toca el botón **Compartir** (el icono de un cuadrado con una flecha hacia arriba en la barra de Safari).
3. Selecciona **"Añadir a pantalla de inicio"** (o *"Add to Home Screen"*).
4. Pulsa **Añadir**.
5. Aparecerá el icono de **"Estudio Divertido"** en la pantalla de inicio del iPad con su icono de libro mágico.
6. Al tocarlo, se abrirá a pantalla completa **sin la barra de direcciones ni las pestañas de Safari**, con funcionamiento offline y respuesta táctil instantánea.

---

## 🔒 Zona de Padres / Profesores y PIN

Para proteger los ajustes de la aplicación (como cambiar de mascota, revisar el diagnóstico del backend o resetear datos):
- Pulsa el icono del engranaje ⚙️ en la esquina superior derecha.
- Aparecerá un teclado táctil grande.
- El PIN por defecto es **`1234`** (se puede personalizar en `.env` mediante `PIN_CODE`).

---

## 🧪 Pruebas Unitarias

El proyecto incluye una suite de pruebas con **Vitest** en el backend:
- Validación rigurosa con `zod` para cada tipo de ejercicio (`multiple_choice`, `true_false`, `fill_blank`, `ordering`, `matching`, `flashcard`).
- Limpieza de bloques markdown devueltos por LLMs (` ```json ... ``` `).
- Algoritmo de repetición espaciada SRS (ascenso de intervalos tras aciertos y reprogramación suave tras fallos).
- Integración de endpoints Fastify (`/api/health`, `/api/units`, `/api/auth/verify-pin`).

```bash
cd backend
npm test
```
