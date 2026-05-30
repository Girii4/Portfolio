// Three.js Scene Setup for Stark Arc Reactor Background
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const blueLight = new THREE.PointLight(0x00e5ff, 5, 50);
blueLight.position.set(0, 0, 2);
scene.add(blueLight);

let modelGroup = new THREE.Group();
scene.add(modelGroup);

// Create the Stark Arc Reactor
function createArcReactor() {
    const reactorGroup = new THREE.Group();
    
    // Outer Metallic Ring
    const torusGeometry = new THREE.TorusGeometry(2.5, 0.3, 32, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        metalness: 0.9, 
        roughness: 0.1 
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    reactorGroup.add(torus);

    // Inner Glowing Core
    const coreGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 64);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.rotation.x = Math.PI / 2;
    reactorGroup.add(core);

    // Copper / Gold Spacing Rings inside
    for(let i=0; i<3; i++) {
        const innerTorus = new THREE.Mesh(
            new THREE.TorusGeometry(1.8 - (i*0.2), 0.08, 16, 100),
            new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.9, roughness: 0.2 })
        );
        reactorGroup.add(innerTorus);
    }

    // Struts connecting outer ring to inner core
    const strutGeom = new THREE.BoxGeometry(0.2, 2.5, 0.2);
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8 });
    for(let i=0; i<6; i++) {
        const strut = new THREE.Mesh(strutGeom, strutMat);
        strut.rotation.z = (Math.PI / 3) * i;
        reactorGroup.add(strut);
    }

    return { group: reactorGroup, core: core };
}

const arcReactor = createArcReactor();
modelGroup.add(arcReactor.group);

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.002;

    // Smoothly rotate the entire reactor based on mouse movement
    modelGroup.rotation.y += (mouseX * 0.5 - modelGroup.rotation.y) * 0.05;
    modelGroup.rotation.x += (-mouseY * 0.3 - modelGroup.rotation.x) * 0.05;

    // Spin the reactor slowly
    arcReactor.group.rotation.z += 0.005;

    // Pulse the core's light
    arcReactor.core.material.emissiveIntensity = 1.0 + Math.sin(time) * 0.6;
    blueLight.intensity = 3 + Math.sin(time) * 2;

    renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
