import * as THREE from "three";
import { Player, PlayerController, ThirdPersonCamera } from "./player.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Main {
  static initialize() {
    const canvas = document.getElementById("canvas");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Load sky texture
    this.scene.fog = new THREE.Fog(0xADD8E6, 0, 100);
    
    // Load ground texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath("../resources/");
    textureLoader.load("dirt.png", (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1000, 1000);

      const groundMaterial = new THREE.MeshStandardMaterial({ map: texture });
      const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);
    });

    // Define boundaries
    const boundaryMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.1 });
    const boundaries = [
      { position: [0, 25, -30], rotation: [0, 0, 0] },
      { position: [0, 25, 30], rotation: [0, Math.PI, 0] },
      { position: [-30, 25, 0], rotation: [0, Math.PI / 2, 0] },
      { position: [30, 25, 0], rotation: [0, -Math.PI / 2, 0] },
      { position: [0, 50, 0], rotation: [-Math.PI / 2, 0, 0] },
    ];

    boundaries.forEach(boundary => {
      const boundaryMesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 50), boundaryMaterial);
      boundaryMesh.position.set(...boundary.position);
      boundaryMesh.rotation.set(...boundary.rotation);
      boundaryMesh.receiveShadow = true;
      this.scene.add(boundaryMesh);
    });

    // Add lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.castShadow = true;
    directionalLight.position.set(-3, 19, -18);
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.bias = -0.01;

    this.scene.add(directionalLight);
    this.scene.add(new THREE.DirectionalLightHelper(directionalLight));

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(3, 20, 19);
    this.scene.add(pointLight);

    // Set up third-person camera
    const thirdPersonCamera = new ThirdPersonCamera(this.camera, new THREE.Vector3(-5, 5, 0), new THREE.Vector3(0, 0, 0));
    const playerController = new PlayerController();
    this.player = new Player(thirdPersonCamera, playerController, this.scene);

    // Set up free camera
    this.freeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.freeCamera.position.set(0, 10, 20);
    this.pointerLockControls = new PointerLockControls(this.freeCamera, this.renderer.domElement);
    this.isFreeCamActive = false;

    // Event listeners for pointer lock
    document.addEventListener("click", () => {
      if (this.isFreeCamActive) {
        this.pointerLockControls.lock();
      }
    });

    // Movement variables
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.tiltRight = false;
    this.tiltLeft = false;
    this.moveSpeed = 0.1;
    this.rollSpeed = 0.01;

    // Key event listeners
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  static toggleFreeCamera() {
    this.isFreeCamActive = !this.isFreeCamActive;
    if (this.isFreeCamActive) {
      this.camera = this.freeCamera;
      this.pointerLockControls.lock();
    } else {
      this.camera = this.player.camera.camera;
      this.pointerLockControls.unlock();
    }
  }

  static handleKeyDown(event) {
    switch (event.key) {
      case "w":
        this.moveForward = true;
        break;
      case "s":
        this.moveBackward = true;
        break;
      case "a":
        this.moveLeft = true;
        break;
      case "d":
        this.moveRight = true;
        break;
      case "q":
        this.tiltLeft = true;
        break;
      case "e":
        this.tiltRight = true;
        break;
      case "g":
        this.toggleFreeCamera();
        break;
    }
  }

  static handleKeyUp(event) {
    switch (event.key) {
      case "w":
        this.moveForward = false;
        break;
      case "s":
        this.moveBackward = false;
        break;
      case "a":
        this.moveLeft = false;
        break;
      case "d":
        this.moveRight = false;
        break;
      case "q":
        this.tiltLeft = false;
        break;
      case "e":
        this.tiltRight = false;
        break;
    }
  }

  static render(deltaTime) {
    if (this.isFreeCamActive) {
      const moveVector = new THREE.Vector3();
      if (this.moveForward) {
        moveVector.add(this.pointerLockControls.getDirection(new THREE.Vector3()).multiplyScalar(this.moveSpeed));
      }
      if (this.moveBackward) {
        moveVector.add(this.pointerLockControls.getDirection(new THREE.Vector3()).multiplyScalar(-this.moveSpeed));
      }
      if (this.moveLeft) {
        this.pointerLockControls.moveRight(-this.moveSpeed);
      }
      if (this.moveRight) {
        this.pointerLockControls.moveRight(this.moveSpeed);
      }
      if (this.tiltLeft) {
        this.freeCamera.rotation.z += this.rollSpeed;
      }
      if (this.tiltRight) {
        this.freeCamera.rotation.z -= this.rollSpeed;
      }

      this.freeCamera.position.add(moveVector);

      // Ensure camera stays within boundaries
      const boundarySize = 30;
      this.freeCamera.position.x = Math.max(-boundarySize, Math.min(boundarySize, this.freeCamera.position.x));
      this.freeCamera.position.z = Math.max(-boundarySize, Math.min(boundarySize, this.freeCamera.position.z));
      this.freeCamera.position.y = Math.max(this.freeCamera.position.y, 1.5);
    } else {
      this.player.update(deltaTime);
    }
    this.renderer.render(this.scene, this.camera);
  }
}

// Load models
const gltfLoader = new GLTFLoader();

function loadModel(path, position, rotation, scale) {
  gltfLoader.load(path, (gltf) => {
    const model = gltf.scene;
    model.position.set(...position);
    model.rotation.set(...rotation);
    model.scale.set(...scale);
    Main.scene.add(model);

    model.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
        child.geometry.boundingBox.applyMatrix4(child.matrixWorld);
      }
    });

    model.userData.boundingBox = new THREE.Box3().setFromObject(model);
  }, undefined, (error) => {
    console.error(error);
  });
}

loadModel('resources/Sunshine.glb', [-3, 21, -20], [0, 0, Math.PI / 4], [1, 1, 1]);

// Grass spawner
function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}

function createRandomGrass() {
  gltfLoader.load('resources/grass green.glb', (gltf) => {
    const model = gltf.scene;
    const x = getRandomValue(-40, 40);
    const y = 0;
    const z = getRandomValue(-40, 40);
    const rotationY = getRandomValue(-Math.PI, Math.PI);
    const scale = getRandomValue(4, 4);

    model.position.set(x, y, z);
    model.rotation.set(0, rotationY, 0);
    model.scale.set(scale, scale, scale);

    model.castShadow = true;
    model.receiveShadow = true;
    Main.scene.add(model);
  }, undefined, (error) => {
    console.error(error);
  });
}

for (let i = 0; i < 100; i++) {
  createRandomGrass();
}

Main.initialize();

let lastTime = 0;
function animate(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  Main.render(deltaTime);
  requestAnimationFrame(animate);
}
animate();
