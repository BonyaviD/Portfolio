<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  particleCount: { type: Number, default: 12000 },
  baseColor: { type: String, default: "#07ace4" },
  secondaryColor: { type: String, default: "#b823e1" },
  attractMode: { type: Boolean, default: true }, // شروع با جذب
  mouseRadius: { type: Number, default: 400 },
  forceStrength: { type: Number, default: 1.5 },
  particleSize: { type: Number, default: 5 },
  glowStrength: { type: Number, default: 10 },
  backgroundColor: { type: String, default: "#0d1b2a" },
  toggleOnMove: { type: Boolean, default: true }, // تغییر به دفع بعد از حرکت موس
});

const containerEl = ref(null);
let sceneApi = null;
let currentMode = ref(true); // true = attract, false = repel
let mouseHasMoved = ref(false);


function createScene(container) {
  if (typeof THREE === "undefined") {
    console.warn("THREE.js not loaded");
    return null;
  }

  const scene = new THREE.Scene();
  const bgColor = new THREE.Color(props.backgroundColor);
  scene.fog = new THREE.FogExp2(bgColor, 0.0008);

  const camera = new THREE.PerspectiveCamera(
    70,
    container.clientWidth / container.clientHeight,
    1,
    3000
  );
  camera.position.z = 600;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(props.backgroundColor, 1);
  container.appendChild(renderer.domElement);

  function makeTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(0.7, "rgba(255,255,255,0.08)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  const texture = makeTexture();
  const COUNT = props.particleCount;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const velocities = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const home = new Float32Array(COUNT * 3);

  const c1 = new THREE.Color(props.baseColor);
  const c2 = new THREE.Color(props.secondaryColor);
  const rangeX = 1400,
    rangeY = 900,
    rangeZ = 700;

  for (let i = 0; i < COUNT; i++) {
    const x = (Math.random() - 0.5) * rangeX;
    const y = (Math.random() - 0.5) * rangeY;
    const z = (Math.random() - 0.5) * rangeZ;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    home[i * 3] = x;
    home[i * 3 + 1] = y;
    home[i * 3 + 2] = z;
    velocities[i * 3] = (Math.random() - 0.5) * 0.4;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    const c = Math.random() > 0.45 ? c1 : c2;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const coreMaterial = new THREE.PointsMaterial({
    size: props.particleSize,
    map: texture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
  });
  const core = new THREE.Points(geometry, coreMaterial);
  scene.add(core);

  const glowMaterial = new THREE.PointsMaterial({
    size: props.particleSize * (2.5 + props.glowStrength * 0.5),
    map: texture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.18,
    sizeAttenuation: true,
  });
  const glow = new THREE.Points(geometry, glowMaterial);
  scene.add(glow);

  const mouse = new THREE.Vector2(-9999, -9999);
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const mouseWorld = new THREE.Vector3();

  function updateMouse(e) {
    const rect = container.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) / rect.width * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height * 2 - 1);
    
    // تبدیل به دفع بعد از اولین حرکت
    if (props.toggleOnMove && !mouseHasMoved.value) {
      mouseHasMoved.value = true;
      currentMode.value = false; // تبدیل به repel
    }
  }

  container.addEventListener("mousemove", updateMouse, { passive: true });
  container.addEventListener("mouseleave", () => mouse.set(-9999, -9999));
  container.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches[0]) updateMouse(e.touches[0]);
    },
    { passive: true }
  );
  container.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches[0]) {
        updateMouse(e.touches[0]);
      }
    },
    { passive: true }
  );
  container.addEventListener("touchend", () => mouse.set(-9999, -9999));

  const clock = new THREE.Clock();
  const rSq = props.mouseRadius * props.mouseRadius;
  const dir = new THREE.Vector3();

  function animate() {
    const raf = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, mouseWorld);

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3,
        iy = i * 3 + 1,
        iz = i * 3 + 2;
      pos[ix] += velocities[ix] * dt * 60;
      pos[iy] += velocities[iy] * dt * 60;
      pos[iz] += velocities[iz] * dt * 60;

      pos[ix] += (home[ix] - pos[ix]) * 0.008 * dt * 60;
      pos[iy] += (home[iy] - pos[iy]) * 0.008 * dt * 60;
      pos[iz] += (home[iz] - pos[iz]) * 0.008 * dt * 60;

      const dx = pos[ix] - mouseWorld.x;
      const dy = pos[iy] - mouseWorld.y;
      const dz = pos[iz] - mouseWorld.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < rSq && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / props.mouseRadius) * props.forceStrength * 6 * dt * 60;
        dir.set(dx / dist, dy / dist, dz / dist);
        // استفاده از currentMode.value برای تعیین جذب یا دفع
        const isAttract = props.toggleOnMove ? currentMode.value : props.attractMode;
        const sign = isAttract ? -1 : 1;
        pos[ix] += dir.x * force * sign;
        pos[iy] += dir.y * force * sign;
        pos[iz] += dir.z * force * sign;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    core.rotation.y += 0.0003;
    glow.rotation.y += 0.0003;
    renderer.render(scene, camera);

    return raf;
  }

  let rafId = animate();

  function resize() {
    const w = container.clientWidth,
      h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener("resize", resize);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", updateMouse);
      container.removeEventListener("mouseleave", () => {});
      container.removeEventListener("touchstart", () => {});
      container.removeEventListener("touchmove", () => {});
      container.removeEventListener("touchend", () => {});
      renderer.dispose();
    },
  };
}


onMounted(() => {
  // Load THREE.js dynamically
  const script = document.createElement("script");
  script.src = "https://unpkg.com/three@0.160.0/build/three.min.js";
  script.async = true;
  script.onload = () => {
    try {
      sceneApi = createScene(containerEl.value);
    } catch (err) {
      console.warn("Particle field disabled:", err.message);
    }
  };
  document.head.appendChild(script);
});

onBeforeUnmount(() => {
  sceneApi?.destroy();
  sceneApi = null;
});
</script>

<template>
  <div ref="containerEl" class="particle-field-canvas" aria-hidden="true"></div>
</template>

<style scoped>
.particle-field-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
</style>

