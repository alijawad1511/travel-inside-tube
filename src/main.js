import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import spline from './spline.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

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

// Post Processing
const renderScene = new RenderPass(scene,camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(
    window.innerWidth,
    window.innerHeight
  ),
  1.5,
  0.4,
  100
);
bloomPass.threshold = 0.002;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
const effectComposer = new EffectComposer(renderer);
effectComposer.addPass(renderScene);
effectComposer.addPass(bloomPass);

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
const tube = new THREE.Mesh(tubeGeometry,tubeMaterial);


const tubePositions = tubeGeometry.attributes.position;
const pointsGeometry = new THREE.BufferGeometry();
pointsGeometry.setAttribute('position',tubePositions);
const pointsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.025
});
const tubePoints = new THREE.Points(pointsGeometry,pointsMaterial);
scene.add(tubePoints);



// Create edges (tube lines) from spline
const edgesGeometry = new THREE.EdgesGeometry(tubeGeometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const tubeLines = new THREE.LineSegments(edgesGeometry, edgesMaterial);
scene.add(tubeLines);

// Create random boxes inside the tube
const numBoxes = 100;
const boxSize = 0.075;
const boxGeometry = new THREE.BoxGeometry(boxSize,boxSize,boxSize);
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true
});

const randomColors = [
  0xff0000,
  0x00ff00,
  0xffff00,
  0xff00ff,
  0x00ffff,
  0xffffff,
  0x000000,
  0x808080,
];

const boxes = [];
for (let i = 0; i < numBoxes; i++) {
  const box = new THREE.Mesh(boxGeometry,boxMaterial);

  // Box random position inside the tube
  const p = (i / numBoxes + Math.random() * 0.1) % 1;
  const pos = tubeGeometry.parameters.path.getPointAt(p);
  pos.x += Math.random() * 0.4;
  pos.z += Math.random() * 0.4;

  // Box randomrotation inside the tube
  const rotation = new THREE.Vector3(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  // Convert box geometry into edge lines (hide diagonal lines of the boxes)
  const boxEdgesGeometry = new THREE.EdgesGeometry(boxGeometry);
  const boxEdgesMaterial = new THREE.LineBasicMaterial({ color: randomColors[Math.floor(Math.random() * randomColors.length)] });
  const boxLines = new THREE.LineSegments(boxEdgesGeometry, boxEdgesMaterial);

  boxLines.position.copy(pos);
  boxLines.rotation.set(rotation.x,rotation.y,rotation.z);

  scene.add(boxLines);
  // scene.add(box);
}

function updateCamera(t) {
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
  effectComposer.render(scene, camera);
  controls.update();
}
animate();