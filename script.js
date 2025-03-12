let scene, camera, renderer, controls, model;
let ambientLight, dirLight;
let currentModel = 'human.glb'; // โมเดลเริ่มต้น (ชาย)

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // เพิ่มแสง Ambient และ Directional
    ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(3, 5, 2);
    scene.add(dirLight);

    // โหลดโมเดลเริ่มต้น
    loadModel(currentModel);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// โหลดโมเดล 3D
function loadModel(modelName) {
    if (model) {
        scene.remove(model);
    }

    const loader = new THREE.GLTFLoader();
    loader.load('./models/' + modelName, (gltf) => {
        model = gltf.scene;
        model.scale.set(1, 1, 1);

        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 0xffffff,
                    metalness: 0,
                    roughness: 0.5
                });

                // ตรวจสอบว่ามี Morph Targets หรือไม่
                if (child.morphTargetInfluences) {
                    console.log("🎭 Morph Targets Found:", child.morphTargetDictionary);
                }
            }
        });

        scene.add(model);
    });
}

// เปลี่ยนเสื้อผ้าโดยอัปเดต Texture
function changeClothes(textureFile) {
    if (model) {
        const loader = new THREE.TextureLoader();
        loader.load('./textures/' + textureFile, function(texture) {
            model.traverse((child) => {
                if (child.isMesh && child.name.includes("shirt")) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });
        }, undefined, function(error) {
            console.error("❌ โหลด Texture ไม่สำเร็จ:", error);
        });
    }
}

// ปรับระดับแสง
function updateLight(value) {
    ambientLight.intensity = parseFloat(value);
    dirLight.intensity = parseFloat(value);
}

// ปรับขนาดของโมเดล
function updateScale(value) {
    if (model) {
        model.scale.set(value, value, value);
    }
}

// ปรับขนาดร่างกายโดยใช้ Morph Targets
function updateMorph(index, value) {
    if (model) {
        model.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences) {
                child.morphTargetInfluences[index] = parseFloat(value);
            }
        });
    }
}

// ฟังก์ชันเปลี่ยนเพศ
function switchGender() {
    currentModel = (currentModel === 'human.glb') ? 'human_G.glb' : 'human.glb';
    loadModel(currentModel);
}

// อัปเดตขนาด renderer เมื่อเปลี่ยนขนาดหน้าจอ
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
