// three-scene.mjs — 3D tier scaffold. Reloads the reference's OWN copied glTF (see copy-assets.mjs /
// canvas-capture.js) into a fresh scene — exact geometry/materials, independent code. Match canvas
// CSS size + devicePixelRatio + the camera path you sampled. Host page MUST include the import map
// from index.html (addon loaders use the bare "three" specifier). See references/30-webgl-3d.md.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function mountScene(canvas, { modelUrl, cameraFrom = [0, 0, 4], background = null, onScroll } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !background });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  if (background) scene.background = new THREE.Color(background);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(...cameraFrom);
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 2); scene.add(key);

  let root = null;
  if (modelUrl) new GLTFLoader().load(modelUrl, g => { root = g.scene; scene.add(root); });

  function resize() { const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); }
  resize(); addEventListener('resize', resize);

  const progress = () => { const max = document.documentElement.scrollHeight - innerHeight; return max > 0 ? scrollY / max : 0; };
  renderer.setAnimationLoop(() => {
    if (root) { if (onScroll) onScroll(root, camera, progress()); else root.rotation.y += 0.003; }
    renderer.render(scene, camera);
  });
  return { scene, camera, renderer };
}
