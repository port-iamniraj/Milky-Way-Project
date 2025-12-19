import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import sunImg from "./images/sun.jpg";
import mercury from "./images/mercury.jpg";
import venus from "./images/venus.jpg";
import earth from "./images/earth.jpg";
import mars from "./images/mars.jpg";
import jupiter from "./images/jupiter.jpg";
import saturn from "./images/saturn.jpg";
import uranus from "./images/uranus.jpg";
import neptune from "./images/neptune.jpg";
import saturnRing from "./images/saturn_ring.png";

/* ===================== BASIC SETUP ===================== */

const canvas = document.getElementById('solarSystemCanvas');

const scene = new THREE.Scene();
const galaxyGroup = new THREE.Group();
const blackHoleRadius = 150;

const blackHoleVoid = new THREE.Mesh(
  new THREE.SphereGeometry(blackHoleRadius, 256),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    depthWrite: true,
    depthTest: true,
  })
);

blackHoleVoid.rotation.x = -Math.PI / 2;
galaxyGroup.add(blackHoleVoid);

const photonRing = new THREE.Mesh(
  new THREE.RingGeometry(
    blackHoleRadius * 2,
    blackHoleRadius * 1.15,
    256
  ),
  new THREE.MeshBasicMaterial({
    color: new THREE.Color(5.0, 3.0, 1),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
);

photonRing.rotation.x = Math.PI / 2;
// photonRing.rotation.y = Math.PI / 1.05;

galaxyGroup.add(photonRing);

const photonRing2 = new THREE.Mesh(
  new THREE.RingGeometry(
    blackHoleRadius * 1.3,
    blackHoleRadius * 1,
    256
  ),
  new THREE.MeshBasicMaterial({
    color: new THREE.Color(5.0, 3.0, 1.0),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
);

photonRing2.rotation.y = Math.PI / 1.95;
galaxyGroup.add(photonRing2);


const milkyWay = createMilkyWayDisk();

/* ===================== BLACK HOLE ===================== */

galaxyGroup.add(milkyWay);
// milkyWay.rotation.x = Math.PI * 0.25;
scene.add(galaxyGroup);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 500000);
camera.position.set(2650, 10, 300);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 🔥 Cinematic rendering
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.physicallyCorrectLights = true;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ===================== POST PROCESSING ===================== */

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5, // strength
  0.4, // radius
  0.7 // threshold
);
composer.addPass(bloomPass);

/* ===================== CONTROLS ===================== */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enablePan = true;
controls.enableZoom = true;
controls.screenSpacePanning = false;
controls.maxDistance = 7000;
controls.minDistance = 0;
// controls.zoomSpeed = 1.0;

// controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = 0; // Prevent moving below the horizon

/* ===================== GALAXY ZOOM CONTROL ===================== */

// let galaxyZoom = 1;

// window.addEventListener("wheel", (e) => {
//   galaxyZoom += e.deltaY * 0.0005;
//   galaxyZoom = THREE.MathUtils.clamp(galaxyZoom, 0.2, 2.5);
// });

/* ===================== TEXTURES ===================== */

const textureLoader = new THREE.TextureLoader();

const sunTexture = textureLoader.load(sunImg);
const mercuryTexture = textureLoader.load(mercury);
const venusTexture = textureLoader.load(venus);
const earthTexture = textureLoader.load(earth);
const marsTexture = textureLoader.load(mars);
const jupiterTexture = textureLoader.load(jupiter);
const saturnTexture = textureLoader.load(saturn);
const saturnRingTexture = textureLoader.load(saturnRing);
const uranusTexture = textureLoader.load(uranus);
const neptuneTexture = textureLoader.load(neptune);

const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
[
  sunTexture,
  mercuryTexture,
  venusTexture,
  earthTexture,
  marsTexture,
  jupiterTexture,
  saturnTexture,
  uranusTexture,
  neptuneTexture
].forEach((texture) => {
  texture.anisotropy = maxAnisotropy;
  // texture.colorSpace = THREE.SRGBColorSpace;
});

/* ===================== SUN ===================== */

const sunGeometry = new THREE.SphereGeometry(10, 128, 128);
const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture,
  emissive: new THREE.Color(0xffaa00),
  emissiveIntensity: 2.5,
  emissiveMap: sunTexture,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);

const rimLight = new THREE.DirectionalLight(0x88aaff, 0.4);
rimLight.position.set(-100, 50, -100);
scene.add(rimLight);

/* ===================== PLANETS ===================== */

const planetsConfig = [
  { name: "mercury", texture: mercuryTexture, size: 0.5, distance: 20, rotationSpeed: 2.0, orbitSpeed: 0.8 },
  { name: "venus", texture: venusTexture, size: 0.7, distance: 30, rotationSpeed: 1.5, orbitSpeed: 0.5 },
  { name: "earth", texture: earthTexture, size: 1, distance: 40, rotationSpeed: 1.0, orbitSpeed: 0.3 },
  { name: "mars", texture: marsTexture, size: 0.6, distance: 50, rotationSpeed: 0.8, orbitSpeed: 0.2 },
  { name: "jupiter", texture: jupiterTexture, size: 3, distance: 60, rotationSpeed: 0.5, orbitSpeed: 0.1 },
  { name: "saturn", texture: saturnTexture, size: 2, distance: 70, rotationSpeed: 0.4, orbitSpeed: 0.08, hasRings: true },
  { name: "uranus", texture: uranusTexture, size: 1.5, distance: 80, rotationSpeed: 0.3, orbitSpeed: 0.05 },
  { name: "neptune", texture: neptuneTexture, size: 1.5, distance: 90, rotationSpeed: 0.2, orbitSpeed: 0.03 },
];

function addAtmosphere(planet, size) {
  const geo = new THREE.SphereGeometry(size * 1.05, 64, 64);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x3399ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
  });
  planet.add(new THREE.Mesh(geo, mat));
}

function createPlanet({ name, texture, size, distance, rotationSpeed, orbitSpeed, hasRings }) {
  const geometry = new THREE.SphereGeometry(size, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.7,
    metalness: 0,
    envMapIntensity: 1.2,
  });
  const planet = new THREE.Mesh(geometry, material);

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide,
  });

  const glowMesh = new THREE.Mesh(
    new THREE.SphereGeometry(size * 1.08, 32, 32),
    glowMat
  );

  planet.add(glowMesh);

  planet.distance = distance;
  planet.rotationSpeed = rotationSpeed;
  planet.orbitSpeed = orbitSpeed;

  planet.castShadow = true;
  planet.receiveShadow = true;

  if (name === "earth") addAtmosphere(planet, size);

  if (hasRings) {
    const ringGeometry = new THREE.RingGeometry(size * 1.5, size * 2.5, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: saturnRingTexture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.5;

    // Group Planet and Ring
    const group = new THREE.Group();
    group.add(planet);
    group.add(ring);

    return { mesh: planet, group };
  } else {

    return { mesh: planet };
  }
}

const planets = planetsConfig.map(createPlanet);

/* ===================== SOLAR SYSTEM ===================== */

const solarSystemGroup = new THREE.Group();

galaxyGroup.add(solarSystemGroup);

solarSystemGroup.add(sun);
planets.forEach(({ mesh, group }) => {
  solarSystemGroup.add(group || mesh);
});

solarSystemGroup.position.set(2500, 0, 800);

const galaxyCenter = new THREE.Vector3(0, 0, 0);

let focusMode = "solar"; // "galaxy" or "solar"
window.addEventListener("keydown", (e) => {
  if (e.key === "1") {
    focusMode = "galaxy";
  }

  if (e.key === "2") {
    focusMode = "solar";
  }

  controls.update();
});

/* ===================== STARS ===================== */

// Star setup
function createVolumeStars() {
  const starCount = 10000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  const minRadius = 2000;
  const maxRadius = 200000;

  for (let i = 0; i < starCount; i++) {
    const r = THREE.MathUtils.randFloat(minRadius, maxRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    positions.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    sizeAttenuation: true,
    depthWrite: false,
    transparent: true,
    opacity: 0.9,
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  return stars;
}

const volumeStars = createVolumeStars();

function createFarStars() {
  const count = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const radius = 100000;

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    sizeAttenuation: false,
    depthWrite: false,
    transparent: true,
    opacity: 0.9,
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}

const farStars = createFarStars();

/* ===================== Milkey way Disk ===================== */

function createMilkyWayDisk() {
  const count = 12000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  const arms = 4;
  const radius = 4000;

  for (let i = 0; i < count; i++) {
    const r = Math.random() * radius;
    const fade = 1 - r / radius;
    const arm = i % arms;
    const spin = r * 0.0050;
    const armOffset = (arm / arms) * Math.PI * 2;

    if (r < 500) continue;

    const angle =
      armOffset +
      spin +
      (Math.random() - 0.5) * 1;

    const x = Math.cos(angle) * r;
    const y = (Math.random() - 0.5) * 200;
    const z = Math.sin(angle) * r;

    positions.push(x, y, z);

    const c = new THREE.Color().setHSL(
      0.6,
      0.3,
      0.5 + fade * 1
    );
    colors.push(c.r, c.g, c.b);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

/* ===================== LIGHTS ===================== */

const galacticAmbient = new THREE.AmbientLight(
  0x8899aa,
  0.15
);
scene.add(galacticAmbient);

const galacticCoreLight = new THREE.PointLight(
  0xffcc88,
  0.4,
  12000,
  2
);

galacticCoreLight.position.set(0, 0, 0);
scene.add(galacticCoreLight);

const sunlight = new THREE.PointLight(0xffffff, 2, 100);
sunlight.position.set(0, 0, 0);
sunlight.castShadow = true;
// sunlight.shadow.mapSize.width = 1024;
// sunlight.shadow.mapSize.height = 1024;

scene.add(sunlight);

/* ===================== ANIMATION ===================== */

const clock = new THREE.Clock();

const tempTarget = new THREE.Vector3();
const blackHoleLook = new THREE.Vector3();
const blackHoleQuat = new THREE.Quaternion();
const smoothQuat = new THREE.Quaternion();

const solarWorldPos = new THREE.Vector3();

function animate() {
  const delta = clock.getDelta();

  if (focusMode === "solar") {
    solarSystemGroup.getWorldPosition(solarWorldPos);
    controls.target.lerp(solarWorldPos, 1);
  } else {
    controls.target.lerp(galaxyCenter, 0.05);
  }

  sun.rotation.z -= 0.5 * delta;
  galaxyGroup.rotation.y += 0.01 * delta;
  scene.rotation.y += 0.002 * delta;

  photonRing.rotation.z += 0.0012;
  photonRing2.rotation.z -= 0.0008;

  // === CAMERA-FACING BLACK HOLE DISK ===
  camera.getWorldPosition(blackHoleLook);

  // Make rings face camera
  photonRing2.lookAt(blackHoleLook);

  // Smooth rotation (prevents snapping)
  smoothQuat.slerp(photonRing2.quaternion, 0.15);
  photonRing2.quaternion.copy(smoothQuat);

  farStars.position.copy(camera.position);

  // Smooth galaxy-scale zoom.
  // camera.position.multiplyScalar(1 + (galaxyZoom - 1) * 0.02);

  planets.forEach(({ mesh, group }) => {
    const time = clock.getElapsedTime() * mesh.orbitSpeed;

    if (group) {
      group.position.x = Math.sin(time) * mesh.distance;
      group.position.y = Math.cos(time) * mesh.distance;
    } else {
      mesh.position.x = Math.sin(time) * mesh.distance;
      mesh.position.y = Math.cos(time) * mesh.distance;
    }

    mesh.rotation.z += mesh.rotationSpeed * delta;
  });

  controls.update();

  composer.render();
  requestAnimationFrame(animate);
}

animate();