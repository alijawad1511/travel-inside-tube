import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import spline from './spline.js';

// Create scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.4);

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);camera.position.z = 5;


// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// Create a line from spline
const points = spline.getPoints(100);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
const line = new THREE.Line(geometry, material);
// scene.add(line);

// Create a tube geometry from spline
const tubeGeometry = new THREE.TubeGeometry(spline,222,0.65,16,true);
const tubeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  // side: THREE.DoubleSide,
  wireframe: true
});
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(tube);


function updateCamera(t) {
  console.log('Time: ', t);
  const time = t * 0.1;
  const loopTime = 8 * 1000; // 20 seconds
  const progress = (time % loopTime) / loopTime;
  const pos = spline.getPointAt(progress);
  const lookAtPoint = spline.getPointAt((progress + 0.03) % 1);
  camera.position.copy(pos);
  camera.lookAt(lookAtPoint);
}

// Responsiveness
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate(t = 0) {
  requestAnimationFrame(animate);
  updateCamera(t);
  renderer.render(scene, camera);
  controls.update();
}
animate();