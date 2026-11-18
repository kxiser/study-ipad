---
name: dynamic-pedagogy-no-hardcode
description: |
  Estándar pedagógico y directiva estricta de NO HARDCODEAR NADA (Zero-Hardcoding Principle) para el desarrollo de la app educativa infantil (3.º de Primaria / 8 años).
  Garantiza que toda pregunta, opción, pareja de relación, pista o dibujo se derive procedural y dinámicamente del contexto real, eliminando textos genéricos quemados en código.
  Gobierna la rotación y variación de preguntas, el barajado continuo, la agrupación inteligente de temas duplicados y la gamificación motivadora (combos, cromos, dibujos).
license: MIT
metadata:
  author: Antigravity Deepmind & Angel Alvarez
  version: "1.0.0"
---

# Dynamic Pedagogy & Zero-Hardcoding Skill

Esta skill establece las leyes de desarrollo y didáctica infantil para el proyecto educativo del iPad de 3.º de Primaria (8 años).

---

## 1. Regla de Oro: PROHIBIDO EL HARDCODING (Zero Hardcoding Principle)

### A. Erradicación de Placeholders y Textos Quemados en Código
1. **Queda terminantemente prohibido quemar cadenas estáticas** como:
   - `"Concepto"` y `"Definición"` en emparejamientos (`matching` / `MemoryGame`).
   - `"palabra"`, `"respuesta"`, o `" ___ ."` sin contexto en `fill_blank`.
   - Repeticiones monótonas de conceptos comodín (como recurrir siempre a *"Atlántico"*, *"el perro"*, o *"aeropuertos"*).
2. **Generación y Transformación Dinámica**:
   - Toda pareja de relación debe ser semánticamente relevante para el tema (ej: *Animal $\leftrightarrow$ Grupo*, *Palabra $\leftrightarrow$ Antónimo*, *Operación $\leftrightarrow$ Resultado*, *Pico $\leftrightarrow$ Cordillera*).
   - Los fallbacks nunca deben ser constantes vacías; deben inferirse algorítmicamente de la explicación didáctica, la materia o el título de la unidad.

### B. Sanitización en Entrada y Salida
- Todo ejercicio que provenga del backend, del almacenamiento local (`localStorage`) o del modelo de IA debe pasar por el sanitizador (`sanitizeExerciseSet`) antes de ser renderizado en cualquier pantalla o minijuego.
- Si un ejercicio llega con opciones vacías o textos deficientes, el motor debe regenerar distractores plausibles dinámicamente según la materia.

---

## 2. Motor Pedagógico Activo (3.º de Primaria / 8 Años)

### A. Rotación y Variación de Preguntas (Interleaving)
1. **Nunca preguntar siempre de la misma forma**:
   - Alternar formatos sobre un mismo concepto:
     * Ángulo directo: *¿Cuál es la sílaba tónica de "música"?*
     * Ángulo de deducción inversa: *Una palabra que siempre lleva tilde porque su fuerza está en la antepenúltima sílaba es...*
     * Ángulo verdadero/falso: *La palabra "camión" es llana. ¿Verdadero o falso?*
     * Ángulo de completar hueco con contexto.
2. **Barajado Continuo**:
   - Las preguntas y el orden de las opciones múltiples deben barajarse (`Math.random() - 0.5`) al inicio de cada sesión para evitar el aprendizaje por memoria de posición o repetición mecánica.

### B. Agrupación Inteligente de Temas (Clustering)
- Cuando el alumno o padre escanea varias páginas de un mismo tema (ej: página 14 y página 15 de "El Relieve"), el sistema debe **agrupar automáticamente los temas escaneados similares** bajo una misma carpeta conceptual (ej: *📁 La Montaña y el Relieve: 2 temas combinados • 13 actividades*) para evitar duplicados y desorden en la biblioteca.

### C. Repaso y Juego Multi-Tema (Intercalación)
- El alumno debe poder seleccionar **más de un tema simultáneamente** con checkboxes para iniciar una sesión combinada o jugar partidas con preguntas mezcladas de varias materias a la vez (ej: 5 preguntas de Lengua + 5 de Matemáticas).

---

## 3. Dinámicas de Enganche Infantil (Engagement & Gamification)

Para que un niño de 8 años se mantenga motivado y enfocado:
1. **Ilustraciones Visuales Automáticas (`EducationalIllustration`)**:
   - Cada pregunta debe acompañarse de insignias visuales dinámicas con colores vivos, iconos y emojis temáticos acordes al concepto tratado (animales, planetas, volcanes, relojes, tildes).
2. **Multiplicador de Racha (Combo Flame)**:
   - Aciertos consecutivos activan multiplicadores:
     * 2 aciertos: *⚡ ¡COMBO x2!*
     * 3 aciertos: *🔥 ¡SUPER COMBO x3! (+estrellas bonus)*
     * 5 aciertos: *🏆 ¡MEGA COMBO x5! ¡Sobre sorpresa desbloqueado!*
   - Al fallar, el tono de la mascota siempre debe ser constructivo y de apoyo (*"¡Casi! De los errores se aprende"*), reiniciando el combo sin castigar al niño.
3. **Álbum de Cromos Mágicos Coleccionables (`StickerAlbumModal`)**:
   - Al completar sesiones con alta precisión o mantener rachas de aciertos, el alumno gana sobres de cromos misteriosos con animaciones de brillo y celebración para coleccionar 12 cartas míticas escolares.
