import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  Heart,
  Star,
  RotateCcw,
  Trophy,
  Check,
  HelpCircle,
  Play,
  Pause,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects.js';
import { ConfettiCelebration } from '../ConfettiCelebration.js';
import { SpeechButton } from '../SpeechButton.js';
import { completeStudySession } from '../../services/api.js';
import { getDynamicGameQuestions, GameQuestion } from '../../utils/questionReformulator.js';
import { ExerciseItem } from '../../types.js';
import { getSelectedCharacter, PlayableCharacter } from '../../utils/characters.js';
import { CharacterSelectorModal } from '../CharacterSelectorModal.js';

interface Adventure3DGameProps {
  exercises?: ExerciseItem[];
  title?: string;
  onBack: () => void;
  onStarsEarned?: (stars: number) => void;
}

interface QuestionStation {
  mesh: THREE.Group;
  question: GameQuestion;
  solved: boolean;
  boxMesh?: THREE.Mesh;
  zPos: number;
}

interface CollectibleStar {
  mesh: THREE.Group;
  collected: boolean;
}

export const Adventure3DGame: React.FC<Adventure3DGameProps> = ({
  exercises = [],
  title = 'Super Aventura 3D',
  onBack,
  onStarsEarned
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Estados del juego
  const [hero, setHero] = useState<PlayableCharacter>(getSelectedCharacter());
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [score, setScore] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Misiones / Preguntas
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<{
    stationIndex: number;
    question: GameQuestion;
  } | null>(null);
  const [questionFeedback, setQuestionFeedback] = useState<{
    isCorrect: boolean;
    text: string;
  } | null>(null);

  // Joystick virtual táctil
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);
  const joystickStartRef = useRef<{ x: number; y: number } | null>(null);
  const moveDirectionRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const isJumpingRef = useRef(false);
  const jumpVelocityRef = useRef(0);

  // Referencias Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const animPartsRef = useRef<{
    leftArm?: THREE.Mesh;
    rightArm?: THREE.Mesh;
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
    wings?: THREE.Group;
    tail?: THREE.Mesh;
    scarf?: THREE.Mesh;
    head?: THREE.Mesh;
  }>({});
  const starsListRef = useRef<CollectibleStar[]>([]);
  const stationsListRef = useRef<QuestionStation[]>([]);
  const particlesListRef = useRef<THREE.Points | null>(null);

  // Inicializar preguntas
  useEffect(() => {
    const list = getDynamicGameQuestions(exercises, 5);
    setQuestions(list);
  }, [exercises]);

  // Actualizar personaje si cambia externamente
  useEffect(() => {
    const handleCharChange = () => setHero(getSelectedCharacter());
    window.addEventListener('study_character_changed', handleCharChange);
    return () => window.removeEventListener('study_character_changed', handleCharChange);
  }, []);

  // Función constructora del modelo 3D del héroe elegido
  const createHeroMesh = useCallback((char: PlayableCharacter): THREE.Group => {
    const group = new THREE.Group();
    animPartsRef.current = {};

    // Colores basados en el personaje
    let primaryColor = 0xff7700; // Naranja chispa
    let secondaryColor = 0xffdd00; // Amarillo
    let accentColor = 0x8844ff; // Morado

    if (char.id === 'luna-buho') {
      primaryColor = 0x7c3aed; // Morado
      secondaryColor = 0xc084fc;
      accentColor = 0xf59e0b;
    } else if (char.id === 'bambu-panda') {
      primaryColor = 0x222222; // Negro panda
      secondaryColor = 0xffffff; // Blanco
      accentColor = 0x10b981; // Verde bambú
    } else if (char.id === 'estrella-unicornio') {
      primaryColor = 0xf472b6; // Rosa
      secondaryColor = 0xffffff;
      accentColor = 0x38bdf8;
    } else if (char.id === 'leo-leon') {
      primaryColor = 0xf59e0b; // Dorado
      secondaryColor = 0xb45309;
      accentColor = 0xef4444;
    } else if (char.id === 'chispa-zorro') {
      primaryColor = 0xea580c; // Zorro
      secondaryColor = 0xffedd5;
      accentColor = 0x9333ea; // Bufanda morada
    }

    const primaryMat = new THREE.MeshToonMaterial({ color: primaryColor });
    const secondaryMat = new THREE.MeshToonMaterial({ color: secondaryColor });
    const accentMat = new THREE.MeshToonMaterial({ color: accentColor });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.6,
      roughness: 0.3
    });

    // 1. CUERPO (Torso con curvas suaves estilo Chibi / Mario)
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.9, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, primaryMat);
    bodyMesh.position.y = 0.9;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Panza de color secundario
    const bellyGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const bellyMesh = new THREE.Mesh(bellyGeo, secondaryMat);
    bellyMesh.position.set(0, 0.9, 0.32);
    bellyMesh.scale.set(1, 1.2, 0.4);
    group.add(bellyMesh);

    // 2. CABEZA (Gran cabeza redonda estilo Kawaii / Chibi)
    const headGeo = new THREE.SphereGeometry(0.68, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, primaryMat);
    headMesh.position.set(0, 1.85, 0);
    headMesh.castShadow = true;
    group.add(headMesh);
    animPartsRef.current.head = headMesh;

    // Ojos Grandes Expresivos
    const eyeGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const pupilGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const glintGeo = new THREE.SphereGeometry(0.03, 8, 8);

    // Ojo Izquierdo
    const eyeL = new THREE.Mesh(eyeGeo, whiteMat);
    eyeL.position.set(-0.25, 1.92, 0.58);
    const pupilL = new THREE.Mesh(pupilGeo, eyeMat);
    pupilL.position.set(-0.25, 1.92, 0.67);
    const glintL = new THREE.Mesh(glintGeo, whiteMat);
    glintL.position.set(-0.23, 1.96, 0.72);
    group.add(eyeL, pupilL, glintL);

    // Ojo Derecho
    const eyeR = new THREE.Mesh(eyeGeo, whiteMat);
    eyeR.position.set(0.25, 1.92, 0.58);
    const pupilR = new THREE.Mesh(pupilGeo, eyeMat);
    pupilR.position.set(0.25, 1.92, 0.67);
    const glintR = new THREE.Mesh(glintGeo, whiteMat);
    glintR.position.set(0.27, 1.96, 0.72);
    group.add(eyeR, pupilR, glintR);

    // Mofletes rositas
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff6688, transparent: true, opacity: 0.6 });
    const cheekGeo = new THREE.CircleGeometry(0.09, 16);
    const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
    cheekL.position.set(-0.42, 1.78, 0.55);
    cheekL.rotation.y = -0.4;
    const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
    cheekR.position.set(0.42, 1.78, 0.55);
    cheekR.rotation.y = 0.4;
    group.add(cheekL, cheekR);

    // 3. BRAZOS ARTICULADOS
    const armGeo = new THREE.CapsuleGeometry(0.14, 0.45, 8, 8);

    const leftArm = new THREE.Mesh(armGeo, primaryMat);
    leftArm.position.set(-0.7, 0.95, 0);
    leftArm.castShadow = true;
    group.add(leftArm);
    animPartsRef.current.leftArm = leftArm;

    const rightArm = new THREE.Mesh(armGeo, primaryMat);
    rightArm.position.set(0.7, 0.95, 0);
    rightArm.castShadow = true;
    group.add(rightArm);
    animPartsRef.current.rightArm = rightArm;

    // 4. PIERNAS / BOTAS
    const legGeo = new THREE.CapsuleGeometry(0.18, 0.4, 8, 8);

    const leftLeg = new THREE.Mesh(legGeo, secondaryMat);
    leftLeg.position.set(-0.3, 0.35, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    animPartsRef.current.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(legGeo, secondaryMat);
    rightLeg.position.set(0.3, 0.35, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    animPartsRef.current.rightLeg = rightLeg;

    // 5. ACCESORIOS ESPECÍFICOS SEGÚN HÉROE
    if (char.id === 'chispa-dragon') {
      // Cuernos dorados de dragón
      const hornGeo = new THREE.ConeGeometry(0.12, 0.4, 8);
      const hornL = new THREE.Mesh(hornGeo, goldMat);
      hornL.position.set(-0.35, 2.5, 0);
      hornL.rotation.z = 0.3;
      const hornR = new THREE.Mesh(hornGeo, goldMat);
      hornR.position.set(0.35, 2.5, 0);
      hornR.rotation.z = -0.3;
      group.add(hornL, hornR);

      // Alas de dragón mágicas
      const wingsGroup = new THREE.Group();
      const wingGeo = new THREE.BoxGeometry(0.5, 0.3, 0.04);
      const wingL = new THREE.Mesh(wingGeo, accentMat);
      wingL.position.set(-0.4, 1.1, -0.45);
      wingL.rotation.y = 0.4;
      const wingR = new THREE.Mesh(wingGeo, accentMat);
      wingR.position.set(0.4, 1.1, -0.45);
      wingR.rotation.y = -0.4;
      wingsGroup.add(wingL, wingR);
      group.add(wingsGroup);
      animPartsRef.current.wings = wingsGroup;

      // Colita con punta de corazón/flecha
      const tailGeo = new THREE.ConeGeometry(0.14, 0.6, 8);
      const tail = new THREE.Mesh(tailGeo, primaryMat);
      tail.position.set(0, 0.65, -0.65);
      tail.rotation.x = -1.2;
      group.add(tail);
      animPartsRef.current.tail = tail;
    } else if (char.id === 'chispa-zorro') {
      // Orejitas puntiagudas de zorro
      const earGeo = new THREE.ConeGeometry(0.2, 0.45, 8);
      const earL = new THREE.Mesh(earGeo, primaryMat);
      earL.position.set(-0.4, 2.45, 0.05);
      earL.rotation.z = 0.25;
      const earR = new THREE.Mesh(earGeo, primaryMat);
      earR.position.set(0.4, 2.45, 0.05);
      earR.rotation.z = -0.25;
      group.add(earL, earR);

      // Bufanda morada alrededor del cuello
      const scarfGeo = new THREE.TorusGeometry(0.52, 0.12, 8, 16);
      const scarf = new THREE.Mesh(scarfGeo, accentMat);
      scarf.position.set(0, 1.35, 0);
      scarf.rotation.x = Math.PI / 2;
      group.add(scarf);

      // Cola esponjosa grande
      const tailGeo = new THREE.ConeGeometry(0.28, 0.85, 12);
      const tail = new THREE.Mesh(tailGeo, primaryMat);
      tail.position.set(0, 0.8, -0.75);
      tail.rotation.x = -1.1;
      group.add(tail);
      animPartsRef.current.tail = tail;
    } else if (char.id === 'luna-buho') {
      // Birrete escolar de graduación
      const capGeo = new THREE.BoxGeometry(0.85, 0.08, 0.85);
      const cap = new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({ color: 0x111122 }));
      cap.position.set(0, 2.5, 0);
      const tasselGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
      const tassel = new THREE.Mesh(tasselGeo, goldMat);
      tassel.position.set(0.35, 2.35, 0.35);
      group.add(cap, tassel);

      // Pico pequeño
      const beakGeo = new THREE.ConeGeometry(0.12, 0.25, 8);
      const beak = new THREE.Mesh(beakGeo, goldMat);
      beak.position.set(0, 1.8, 0.65);
      beak.rotation.x = 1.3;
      group.add(beak);
    } else if (char.id === 'estrella-unicornio') {
      // Cuerno de unicornio mágico brillante
      const hornGeo = new THREE.ConeGeometry(0.12, 0.65, 12);
      const horn = new THREE.Mesh(hornGeo, goldMat);
      horn.position.set(0, 2.6, 0.2);
      horn.rotation.x = -0.25;
      group.add(horn);

      // Luz puntual del cuerno
      const hornLight = new THREE.PointLight(0xff69b4, 1.5, 3);
      hornLight.position.set(0, 2.8, 0.3);
      group.add(hornLight);
    } else if (char.id === 'bambu-panda') {
      // Orejitas negras redondas
      const earGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const earL = new THREE.Mesh(earGeo, primaryMat);
      earL.position.set(-0.45, 2.4, 0);
      const earR = new THREE.Mesh(earGeo, primaryMat);
      earR.position.set(0.45, 2.4, 0);
      group.add(earL, earR);

      // Caña de bambú en la mano
      const bambooGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
      const bamboo = new THREE.Mesh(bambooGeo, accentMat);
      bamboo.position.set(0.85, 1.1, 0.2);
      group.add(bamboo);
    } else if (char.id === 'leo-leon') {
      // Melena dorada esponjosa
      const maneGeo = new THREE.TorusGeometry(0.72, 0.28, 12, 24);
      const mane = new THREE.Mesh(maneGeo, secondaryMat);
      mane.position.set(0, 1.85, -0.1);
      group.add(mane);

      // Corona de rey
      const crownGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.25, 6);
      const crown = new THREE.Mesh(crownGeo, goldMat);
      crown.position.set(0, 2.6, 0);
      group.add(crown);
    }

    return group;
  }, []);

  // Construir y ejecutar el mundo 3D completo
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. ESCENA, CÁMARA Y RENDERIZADOR
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Cielo azul celeste alegre con niebla suave
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.018);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 5, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. ILUMINACIÓN (Sol cálido brillante + Luz ambiental estilo Nintendo)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6dd, 1.4);
    sunLight.position.set(15, 25, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    scene.add(sunLight);

    // 3. TERRENO DEL REINO MÁGICO (Pista infinita de césped y senderos de adoquines)
    const trackLength = 120;
    const groundGeo = new THREE.PlaneGeometry(36, trackLength);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 }); // Verde césped vibrante
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -trackLength / 2 + 10);
    ground.receiveShadow = true;
    scene.add(ground);

    // Sendero central adoquinado
    const pathGeo = new THREE.PlaneGeometry(6, trackLength);
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xfef08a }); // Camino de arena dorada
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.set(0, 0.02, -trackLength / 2 + 10);
    pathMesh.receiveShadow = true;
    scene.add(pathMesh);

    // 4. DECORACIÓN 3D: ÁRBOLES COLORIDOS, NUBES Y FLORES
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const foliageMat1 = new THREE.MeshLambertMaterial({ color: 0x22c55e });
    const foliageMat2 = new THREE.MeshLambertMaterial({ color: 0x15803d });

    // Árboles a los lados del camino
    for (let z = 5; z > -trackLength + 15; z -= 8) {
      [-7 - Math.random() * 4, 7 + Math.random() * 4].forEach(x => {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 2.5, 8), trunkMat);
        trunk.position.y = 1.25;
        trunk.castShadow = true;
        tree.add(trunk);

        // Copas cónicas triples estilo Mario
        const fol1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2, 8), foliageMat1);
        fol1.position.y = 2.8;
        fol1.castShadow = true;
        const fol2 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.8, 8), foliageMat2);
        fol2.position.y = 3.8;
        fol2.castShadow = true;
        tree.add(fol1, fol2);

        tree.position.set(x, 0, z);
        scene.add(tree);
      });
    }

    // Nubes esponjosas flotantes en el cielo
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
    for (let i = 0; i < 15; i++) {
      const cloud = new THREE.Group();
      for (let c = 0; c < 5; c++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random() * 1.5, 12, 12), cloudMat);
        puff.position.set((c - 2) * 1.4, Math.random() * 0.5, Math.random() * 0.8);
        cloud.add(puff);
      }
      cloud.position.set((Math.random() - 0.5) * 60, 16 + Math.random() * 8, -Math.random() * trackLength);
      scene.add(cloud);
    }

    // 5. ESTRELLAS DORADAS COLECCIONABLES FLOTANTES
    starsListRef.current = [];
    const starShape = new THREE.Shape();
    const starPts = 5;
    for (let i = 0; i < starPts * 2; i++) {
      const r = i % 2 === 0 ? 0.55 : 0.25;
      const a = (i / starPts) * Math.PI;
      const sx = Math.sin(a) * r;
      const sy = Math.cos(a) * r;
      if (i === 0) starShape.moveTo(sx, sy);
      else starShape.lineTo(sx, sy);
    }
    const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04 });
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffe000,
      emissive: 0xffa500,
      emissiveIntensity: 0.35,
      metalness: 0.8,
      roughness: 0.2
    });

    for (let z = 0; z > -trackLength + 20; z -= 5) {
      const starGroup = new THREE.Group();
      const starMesh = new THREE.Mesh(starGeo, starMat);
      starGroup.add(starMesh);
      starGroup.position.set((Math.random() - 0.5) * 4, 1.4, z);
      scene.add(starGroup);
      starsListRef.current.push({ mesh: starGroup, collected: false });
    }

    // 6. ESTACIONES DE PREGUNTAS Y BLOQUES MISTERIOSOS [?] EN 3D
    stationsListRef.current = [];
    const stationPositionsZ = [-18, -38, -58, -78, -98];
    const availableQuestions = questions.length > 0 ? questions : getDynamicGameQuestions(exercises, 5);

    stationPositionsZ.forEach((zPos, index) => {
      const q = availableQuestions[index % availableQuestions.length];
      const stationGroup = new THREE.Group();

      // Bloque [?] estilo Super Mario
      const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xb45309,
        emissiveIntensity: 0.25,
        roughness: 0.3
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.position.y = 2.4;
      boxMesh.castShadow = true;
      stationGroup.add(boxMesh);

      // Signo de interrogación 3D en el bloque
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 84px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 64, 64);
      }
      const qTexture = new THREE.CanvasTexture(canvas);
      const qMat = new THREE.MeshBasicMaterial({ map: qTexture });
      const qSign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), qMat);
      qSign.position.set(0, 2.4, 0.81);
      stationGroup.add(qSign);

      // Plataforma de parada mágica
      const padGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.4, 24);
      const padMat = new THREE.MeshLambertMaterial({ color: 0x9333ea }); // Púrpura mágico
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.position.y = 0.2;
      padMesh.receiveShadow = true;
      stationGroup.add(padMesh);

      // Anillo de luz brillante
      const ringGeo = new THREE.RingGeometry(2.5, 2.7, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.42;
      stationGroup.add(ringMesh);

      stationGroup.position.set(0, 0, zPos);
      scene.add(stationGroup);

      stationsListRef.current.push({
        mesh: stationGroup,
        question: q,
        solved: false,
        boxMesh,
        zPos
      });
    });

    // 7. META FINAL: CASTILLO DEL SABER CON BANDERA
    const castleGroup = new THREE.Group();
    castleGroup.position.set(0, 0, -trackLength + 10);

    const castleWallGeo = new THREE.BoxGeometry(10, 6, 3);
    const castleMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const castleWall = new THREE.Mesh(castleWallGeo, castleMat);
    castleWall.position.y = 3;
    castleWall.castShadow = true;
    castleGroup.add(castleWall);

    // Torres a los lados
    const towerGeo = new THREE.CylinderGeometry(1.6, 1.8, 8, 12);
    const roofGeo = new THREE.ConeGeometry(2, 3, 12);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });

    [-5, 5].forEach(tx => {
      const tower = new THREE.Mesh(towerGeo, castleMat);
      tower.position.set(tx, 4, 0);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(tx, 9.5, 0);
      castleGroup.add(tower, roof);
    });

    // Puerta del castillo en forma de arco
    const doorGeo = new THREE.BoxGeometry(3.5, 4.5, 0.5);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 2.25, 1.55);
    castleGroup.add(door);

    scene.add(castleGroup);

    // 8. CREAR EL AVATAR 3D Y COLOCARLO
    const heroGroup = createHeroMesh(hero);
    heroGroup.position.set(0, 0, 4);
    scene.add(heroGroup);
    playerGroupRef.current = heroGroup;

    // 9. BUCLE DE ANIMACIÓN Y RENDER A 60 FPS
    let clock = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.035;

      const player = playerGroupRef.current;
      if (!player) return;

      // Movimiento con joystick / teclado
      const dir = moveDirectionRef.current;
      const speed = 0.22;
      const isMoving = Math.abs(dir.x) > 0.05 || Math.abs(dir.z) > 0.05;

      if (!isPaused && !hasWon && !isGameOver) {
        player.position.x += dir.x * speed;
        player.position.z += dir.z * speed;

        // Limitar dentro del camino
        player.position.x = Math.max(-4.5, Math.min(4.5, player.position.x));

        // Rotar al jugador en la dirección de avance
        if (isMoving) {
          const targetAngle = Math.atan2(dir.x, dir.z);
          player.rotation.y = targetAngle;
        }

        // Físicas de salto
        if (isJumpingRef.current) {
          player.position.y += jumpVelocityRef.current;
          jumpVelocityRef.current -= 0.038; // Gravedad

          if (player.position.y <= 0) {
            player.position.y = 0;
            isJumpingRef.current = false;
            jumpVelocityRef.current = 0;
          }
        }

        // Animación de correr: balanceo de brazos y piernas
        const parts = animPartsRef.current;
        if (isMoving && !isJumpingRef.current) {
          const legSwing = Math.sin(clock * 14) * 0.65;
          if (parts.leftLeg) parts.leftLeg.rotation.x = legSwing;
          if (parts.rightLeg) parts.rightLeg.rotation.x = -legSwing;
          if (parts.leftArm) parts.leftArm.rotation.x = -legSwing;
          if (parts.rightArm) parts.rightArm.rotation.x = legSwing;
        } else if (!isJumpingRef.current) {
          // Reposo: respiración suave
          if (parts.leftLeg) parts.leftLeg.rotation.x = 0;
          if (parts.rightLeg) parts.rightLeg.rotation.x = 0;
          if (parts.leftArm) parts.leftArm.rotation.x = 0;
          if (parts.rightArm) parts.rightArm.rotation.x = 0;
          player.position.y = Math.sin(clock * 3) * 0.06;
        }

        // Aleteo de alas o movimiento de colita
        if (parts.wings) parts.wings.rotation.y = Math.sin(clock * 8) * 0.3;
        if (parts.tail) parts.tail.rotation.y = Math.sin(clock * 6) * 0.4;

        // Detección de colisiones con Estrellas Doradas
        starsListRef.current.forEach(star => {
          if (!star.collected) {
            star.mesh.rotation.y += 0.05;
            star.mesh.position.y = 1.4 + Math.sin(clock * 4 + star.mesh.position.z) * 0.2;

            const dist = player.position.distanceTo(star.mesh.position);
            if (dist < 1.4) {
              star.collected = true;
              star.mesh.visible = false;
              sounds.playPopSound();
              setStarsCollected(s => s + 1);
              setScore(sc => sc + 10);
            }
          }
        });

        // Detección de estaciones de preguntas [?]
        stationsListRef.current.forEach((st, idx) => {
          if (!st.solved) {
            if (st.boxMesh) {
              st.boxMesh.position.y = 2.4 + Math.sin(clock * 3 + idx) * 0.2;
            }

            const dist = Math.abs(player.position.z - st.zPos);
            // Si el jugador entra en el área de la estación mágica
            if (dist < 2.5 && !activeQuestion) {
              sounds.playFlipSound();
              setActiveQuestion({
                stationIndex: idx,
                question: st.question
              });
              moveDirectionRef.current = { x: 0, z: 0 };
              setJoystickKnob({ x: 0, y: 0 });
            }
          }
        });

        // Detección de llegada a la Meta del Castillo
        if (player.position.z <= -trackLength + 14 && !hasWon) {
          setHasWon(true);
          setShowCelebration(true);
          sounds.playVictorySound();
          const earned = 5;
          completeStudySession({
            sessionType: 'new',
            durationSeconds: 90,
            totalQuestions: 5,
            correctAnswers: 5,
            starsEarned: earned
          }).catch(() => {});
          if (onStarsEarned) onStarsEarned(earned);
        }

        // CÁMARA TERCERA PERSONA: Sigue al jugador suavemente (Smooth Lerp)
        const targetCamX = player.position.x * 0.4;
        const targetCamY = player.position.y + 4.2;
        const targetCamZ = player.position.z + 7.5;

        camera.position.x += (targetCamX - camera.position.x) * 0.12;
        camera.position.y += (targetCamY - camera.position.y) * 0.12;
        camera.position.z += (targetCamZ - camera.position.z) * 0.12;
        camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z - 2);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Redimensionamiento responsive
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [hero, exercises, questions, createHeroMesh]);

  // Manejar respuesta del jugador a la pregunta del bloque [?]
  const handleAnswerOption = (option: string) => {
    if (!activeQuestion) return;
    const q = activeQuestion.question;
    const isCorrect = option === q.correctAnswer;

    if (isCorrect) {
      sounds.playMatchSound();
      setQuestionFeedback({
        isCorrect: true,
        text: `¡Fantástico! "${q.correctAnswer}" es correcto. ${q.explanation || ''}`
      });
      setScore(s => s + 50);

      // Desbloquear estación y permitir seguir
      setTimeout(() => {
        const station = stationsListRef.current[activeQuestion.stationIndex];
        if (station) {
          station.solved = true;
          if (station.boxMesh) {
            station.boxMesh.material = new THREE.MeshStandardMaterial({
              color: 0x10b981,
              emissive: 0x059669
            });
          }
        }
        setActiveQuestion(null);
        setQuestionFeedback(null);
        sounds.playPopSound();
      }, 1800);
    } else {
      sounds.playWobbleSound();
      setQuestionFeedback({
        isCorrect: false,
        text: `¡Casi! Fíjate bien: ${q.explanation || '¡Inténtalo otra vez!'}`
      });
    }
  };

  // Controles de Joystick Táctil
  const handleJoystickStart = (clientX: number, clientY: number, containerEl: HTMLDivElement) => {
    const rect = containerEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickStartRef.current = { x: centerX, y: centerY };
    setIsDraggingJoystick(true);
    updateJoystick(clientX, clientY);
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickStartRef.current) return;
    const deltaX = clientX - joystickStartRef.current.x;
    const deltaY = clientY - joystickStartRef.current.y;
    const maxDist = 48;
    const dist = Math.min(maxDist, Math.hypot(deltaX, deltaY));
    const angle = Math.atan2(deltaY, deltaX);

    const clampedX = Math.cos(angle) * dist;
    const clampedY = Math.sin(angle) * dist;

    setJoystickKnob({ x: clampedX, y: clampedY });

    // Normalizar vector (-1 a 1) para Three.js: -Y en pantalla es avanzar (-Z en Three.js)
    moveDirectionRef.current = {
      x: clampedX / maxDist,
      z: clampedY / maxDist
    };
  };

  const handleJoystickEnd = () => {
    setIsDraggingJoystick(false);
    joystickStartRef.current = null;
    setJoystickKnob({ x: 0, y: 0 });
    moveDirectionRef.current = { x: 0, z: 0 };
  };

  // Control de Salto
  const handleJump = () => {
    if (!isJumpingRef.current && !activeQuestion) {
      isJumpingRef.current = true;
      jumpVelocityRef.current = 0.48; // Impulso vertical
      sounds.playFlipSound();
    }
  };

  // Reiniciar partida
  const restartGame = () => {
    const player = playerGroupRef.current;
    if (player) {
      player.position.set(0, 0, 4);
      player.rotation.set(0, 0, 0);
    }
    starsListRef.current.forEach(s => {
      s.collected = false;
      s.mesh.visible = true;
    });
    stationsListRef.current.forEach(st => {
      st.solved = false;
    });
    setScore(0);
    setStarsCollected(0);
    setLives(3);
    setIsGameOver(false);
    setHasWon(false);
    setShowCelebration(false);
    setActiveQuestion(null);
    setQuestionFeedback(null);
  };

  return (
    <div className="relative w-full h-[88vh] max-w-5xl mx-auto rounded-4xl overflow-hidden shadow-2xl border-4 border-magic-300 bg-sky-200 select-none">
      {showCelebration && <ConfettiCelebration />}

      {/* Contenedor del Canvas Three.js */}
      <div ref={mountRef} className="w-full h-full touch-none" />

      {/* BARRA SUPERIOR HUD FLOTANTE */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 font-extrabold shadow-lg border-2 border-slate-200 active:scale-95 transition-all text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        {/* Marcadores: Héroe, Estrellas y Puntos */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Selector de Héroe 3D */}
          <button
            type="button"
            onClick={() => setShowHeroModal(true)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-magic-200 text-magic-950 hover:bg-white font-black text-xs shadow-lg active:scale-95 transition-all"
            title="Cambiar Héroe 3D"
          >
            <span className="text-xl">{hero.emoji}</span>
            <span className="hidden sm:inline">{hero.name}</span>
          </button>

          {/* Contador de Estrellas Doradas */}
          <div className="flex items-center gap-1.5 bg-amber-400 text-amber-950 px-3.5 py-1.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg border-2 border-amber-300">
            <Star className="w-4 h-4 fill-amber-950" />
            <span>{starsCollected}</span>
          </div>

          {/* Puntuación */}
          <div className="flex items-center gap-1.5 bg-magic-600 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg border-2 border-magic-400">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{score} pts</span>
          </div>
        </div>
      </div>

      {/* CONTROLES TÁCTILES IPAD (JOYSTICK + BOTÓN DE SALTO) */}
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none z-20">
        {/* Joystick Virtual 360° */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow bg-black/40 px-2.5 py-0.5 rounded-full">
            Mover 360°
          </span>
          <div
            className="pointer-events-auto relative w-28 h-28 rounded-full bg-slate-900/50 backdrop-blur-md border-3 border-white/60 shadow-2xl flex items-center justify-center touch-none active:scale-98 transition-transform"
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                handleJoystickStart(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
              }
            }}
            onTouchMove={(e) => {
              if (isDraggingJoystick && e.touches.length > 0) {
                updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleJoystickEnd}
            onMouseDown={(e) => handleJoystickStart(e.clientX, e.clientY, e.currentTarget)}
            onMouseMove={(e) => {
              if (isDraggingJoystick) updateJoystick(e.clientX, e.clientY);
            }}
            onMouseUp={handleJoystickEnd}
          >
            {/* Knob interior que se desplaza */}
            <div
              style={{
                transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-magic-500 to-indigo-500 border-2 border-white shadow-xl flex items-center justify-center text-white"
            >
              <span className="text-lg">{hero.emoji}</span>
            </div>
          </div>
        </div>

        {/* Botón Gigante de Salto para iPad */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleJump}
            className="pointer-events-auto w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-green-500 to-emerald-400 text-white font-black text-base shadow-2xl border-4 border-white flex flex-col items-center justify-center active:scale-90 active:brightness-110 transition-all shadow-emerald-600/40"
          >
            <span className="text-2xl">⬆️</span>
            <span className="text-xs uppercase tracking-wider font-black">Saltar</span>
          </button>
        </div>
      </div>

      {/* MODAL DE PREGUNTA EDUCATIVA DEL BLOQUE MISTERIOSO [?] */}
      {activeQuestion && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl border-4 border-amber-400 animate-scale-up text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>❓ Bloque Misterioso 3D</span>
                <span>• {activeQuestion.question.topic}</span>
              </span>

              <SpeechButton text={activeQuestion.question.question} size="sm" />
            </div>

            <h3 className="text-lg md:text-xl font-black text-slate-800 leading-snug">
              {activeQuestion.question.question}
            </h3>

            {/* Opciones de respuesta claras */}
            <div className="space-y-2.5">
              {activeQuestion.question.options.map((option, idx) => {
                const letters = ['A', 'B', 'C', 'D'];
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAnswerOption(option)}
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-magic-500 bg-slate-50 hover:bg-magic-50 text-slate-800 font-bold text-sm md:text-base flex items-center gap-3 text-left transition-all active:scale-98 shadow-sm"
                  >
                    <span className="w-8 h-8 rounded-xl bg-magic-100 text-magic-700 font-black flex items-center justify-center shrink-0 border border-magic-200">
                      {letters[idx] || '•'}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback pedagógico */}
            {questionFeedback && (
              <div
                className={`p-3.5 rounded-2xl font-bold text-sm text-center animate-fade-in ${
                  questionFeedback.isCorrect
                    ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
                    : 'bg-rose-100 text-rose-900 border-2 border-rose-300'
                }`}
              >
                {questionFeedback.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANTALLA DE VICTORIA AL LLEGAR AL CASTILLO */}
      {hasWon && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-md w-full p-8 text-center space-y-5 shadow-2xl border-4 border-amber-400 animate-scale-up">
            <Trophy className="w-20 h-20 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-3xl font-black text-slate-800">
              ¡Castillo Conquistado!
            </h3>
            <p className="text-sm font-bold text-slate-600">
              ¡Has recorrido el Reino Mágico 3D, resuelto los misterios de 3.º de Primaria y alcanzado la meta!
            </p>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="flex items-center gap-2 bg-sunny-100 border border-sunny-300 px-4 py-2 rounded-2xl font-black text-amber-950">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>+{starsCollected + 5} Estrellas</span>
              </div>
              <div className="flex items-center gap-2 bg-magic-100 border border-magic-300 px-4 py-2 rounded-2xl font-black text-magic-950">
                <Sparkles className="w-5 h-5 text-magic-600" />
                <span>{score} Puntos</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={restartGame}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar de nuevo</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black text-sm active:scale-95 transition-all shadow-md shadow-magic-200"
              >
                <span>Volver al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Personaje */}
      {showHeroModal && (
        <CharacterSelectorModal
          isOpen={showHeroModal}
          onClose={() => setShowHeroModal(false)}
          onSelectCharacter={(selected) => {
            setHero(selected);
            setShowHeroModal(false);
          }}
        />
      )}
    </div>
  );
};
