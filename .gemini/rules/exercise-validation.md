# Reglas del Proyecto "Mi Cuaderno Mágico"

## Contexto de Negocio
- **Usuario principal**: Samantha (8 años, 3.º de Primaria).
- **Dispositivo objetivo**: iPad (PWA táctil, pantalla completa, Web Speech API para lectura en voz alta).
- **Mascota guía**: Chispa (zorro astronauta amigable personalizable con sombreros, gafas y accesorios).
- **Coste**: 100% Free Tier (Google Gemini Vision gratuito, SQLite local/volumen, cero costes recurrentes).

## Reglas de Validación de Ejercicios y Preguntas de IA
1. **Resolución de Respuesta Correcta**:
   - Nunca asumir `options[0]` como correcta cuando la IA no envíe `correctAnswer`.
   - Utilizar siempre coincidencia cruzada con el texto de `explanation` para deducir la opción real correcta.
   - Aceptar índices numéricos (0-based y 1-based), letras (`A`, `B`, `C`, `D`), y strings limpios.
2. **Prohibición de Fallbacks Erróneos**:
   - Jamás inyectar la palabra `'palabra'` en `options` ni en `correctAnswer`.
3. **Verdadero / Falso**:
   - `isTrue` debe evaluarse a `true` si la explicación empieza por afirmaciones de felicitación (*"¡Exacto!"*, *"¡Muy bien!"*) y la afirmación no contradice la ciencia.
4. **Minijuegos**:
   - Cualquier minijuego (Burbujas, Memory, Ruleta, Mapa de Aventura) debe consumir las preguntas validadas y otorgar estrellas a través de `completeStudySession(...)` para actualizar la banca de estrellas de Samantha.
