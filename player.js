import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Player {
    constructor(camera, controller, scene) {
        this.camera = camera;
        this.controller = controller;
        this.scene = scene;
        this.rotationVector = new THREE.Vector3();
        this.targetRotation = new THREE.Vector3();

        this.animations = {};
        this.state = 'idle';
        this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);

        this.loadModel();
        this.loadEnvironmentModels();
    }

    loadModel() {
        var loader = new FBXLoader();
        loader.setPath("../resources/");
        loader.load("Idle.fbx", (fbx) => {
            fbx.scale.setScalar(0.01);
            fbx.traverse(c => {
                c.castShadow = true;
            });
            this.mesh = fbx;
            this.scene.add(this.mesh);
            this.mesh.rotation.y = Math.PI / 2;
            this.targetRotation.y = Math.PI / 2;

            this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

            this.mixer = new THREE.AnimationMixer(this.mesh);
            var onLoad = (animName, anim) => {
                var clip = anim.animations[0];
                var action = this.mixer.clipAction(clip);

                this.animations[animName] = {
                    clip: clip,
                    action: action
                };
            };

            var loader = new FBXLoader();
            loader.setPath("../resources/");
            loader.load('Idle.fbx', (fbx) => { onLoad('idle', fbx); });
            loader.load('Slow Run.fbx', (fbx) => { onLoad('run', fbx); });
        });
    }


    loadEnvironmentModels() {
        const environmentObjects = [
            { path: 'Enviroment/Barn.glb', rotation: [0, 30, 0], scale: [15, 15, 15], position: [-15,0,23] },
            { path: 'Enviroment/Tractor.glb', rotation: [0, 60, 0], scale: [0.3, 0.3, 0.3], position: [10,0,-2] },
            { path: 'Enviroment/Pig.glb', rotation: [0, 30, 0], scale: [0.3, 0.3, 0.3], position: [10,0,10] },
            { path: 'Enviroment/Pig.glb', rotation: [0, 60, 0], scale: [0.3, 0.3, 0.3], position: [17,0,21] },
            { path: 'Enviroment/Pig.glb', rotation: [0, 10, 0], scale: [0.3, 0.3, 0.3], position: [10,0,5] },
            { path: 'Enviroment/Cow.glb', rotation: [0, 25, 0], scale: [0.2, 0.2, 0.2], position: [-10,0,-5.4] },
            { path: 'Enviroment/Cow.glb', rotation: [0, Math.PI, 0], scale: [0.2, 0.2, 0.2], position: [-10,0,5.4] },
            { path: 'Enviroment/Cow.glb', rotation: [0, Math.PI/2, 0], scale: [0.2, 0.2, 0.2], position: [24,0,-24] },
            { path: 'Enviroment/Cow.glb', rotation: [0, Math.PI, 0], scale: [0.2, 0.2, 0.2], position: [19,0,-18] },
            { path: 'Enviroment/Tree.glb', rotation: [0, 0, 0], scale: [3,3,3], position: [14, 2.5, -11] },
            { path: 'Enviroment/Tree.glb', rotation: [0, 0, 0], scale: [3,3,3], position: [9, 2.5, -15] },
            { path: 'Enviroment/Tree.glb', rotation: [0, 0, 0], scale: [3,3,3], position: [-7, 2.5, -14] },
            { path: 'Enviroment/Tree.glb', rotation: [0, 0, 0], scale: [3,3,3], position: [11, 2.5, 15] },
            { path: 'Enviroment/Tree.glb', rotation: [0, 0, 0], scale: [3,3,3], position: [0, 2.5, 15] },
            { path: 'Enviroment/Tree.glb', rotation: [0, 0, 0], scale: [3,3,3], position: [18, 2.5, 0] },
            { path: 'Enviroment/Chicken.glb', rotation: [0, 30, 0], scale: [0.005,0.005,0.005], position: [10,0,-10] },
            { path: 'Enviroment/Chicken.glb', rotation: [0, Math.PI / 2, 0], scale: [0.005,0.005,0.005], position: [12,0,-17] },
            { path: 'Enviroment/Chicken.glb', rotation: [0, Math.PI / 4, 0], scale: [0.005,0.005,0.005], position: [16,0,-12] },
            { path: 'Enviroment/Pond2.glb', rotation: [0, 0, 0], scale: [0.03,0.03,0.03], position: [-10,-0.19,0] },
            { path: 'Enviroment/RockyBase.glb', rotation: [0, Math.PI / 4, 0], scale: [1.2,1.2,1.2], position: [-10,0,-2] },
            { path: 'Enviroment/RockyBase.glb', rotation: [0, -Math.PI / 2, 0], scale: [1.2,1.2,1.2], position: [-10,0,0] },
            { path: 'Enviroment/RockyBase.glb', rotation: [0, -Math.PI / 4, 0], scale: [1.2,1.2,1.2], position: [-8,0.01,1] },
            { path: 'Enviroment/Dump truck.glb', rotation: [0, -Math.PI / 4, 0], scale: [0.7,0.7,0.7], position: [-20,0.4,0] },
            { path: 'Enviroment/Truck.glb', rotation: [0, Math.PI / 2, 0], scale: [0.012,0.012,0.012], position: [0,0,-15] },
            { path: 'Enviroment/House.glb', rotation: [0, Math.PI / 2, 0], scale: [4.5,4.5,4.5], position: [-20,2,-20] },
            { path: 'Enviroment/Farm.glb', rotation: [0, Math.PI / 2, 0], scale: [0.05,0.05,0.05], position: [20,-0.01,20]},
        ];
        const loadedObjects = [];
        const loader = new GLTFLoader();
        loader.setPath("../resources/");
        
        environmentObjects.forEach((obj) => {
            loader.load(obj.path, (gltf) => {
                const model = gltf.scene;
                
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                model.type = "env";
                model.rotation.set(...obj.rotation);
                model.scale.set(...obj.scale);
                model.position.set(...obj.position);
                
                const envHitbox = new THREE.Box3().setFromObject(model, true);
                model.userData.hitbox = envHitbox;;

                this.scene.add(model);
                loadedObjects.push(model); // Keep track of loaded objects for overlap checking
            });
        });
    }


    isPositionWithinBoundaries(position) {
        const boundarySize = 30;

        return (
            Math.abs(position.x) <= boundarySize &&
            Math.abs(position.z) <= boundarySize
        );
    }

    update(dt) {
        if (!this.mesh) return;

        var direction = new THREE.Vector3(0, 0, 0);
        var moveSpeed = 10;

        if (this.controller.key['forward']) {
            direction.x += 1;
        }
        if (this.controller.key['backward']) {
            direction.x -= 1;
        }
        if (this.controller.key['left']) {
            direction.z -= 1;
        }
        if (this.controller.key['right']) {
            direction.z += 1;
        }

        if (direction.length() === 0) {
            if (this.animations['idle']) {
                if (this.state !== 'idle') {
                    this.mixer.stopAllAction();
                    this.state = 'idle';
                }
                this.mixer.clipAction(this.animations['idle'].clip).play();
                this.mixer.update(dt);
            }
        } else {
            if (this.animations['run']) {
                if (this.state !== 'run') {
                    this.mixer.stopAllAction();
                    this.state = 'run';
                }
                this.mixer.clipAction(this.animations['run'].clip).play();
                this.mixer.update(dt);
            }

            direction.normalize();
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotationAngle.y,this.camera.rotationAngle.x);

            const newPosition = this.mesh.position.clone().add(direction.multiplyScalar(dt * moveSpeed));

            if (this.isPositionWithinBoundaries(newPosition)) {
                this.mesh.position.copy(newPosition);
                if (direction.length() > 0) {
                    this.targetRotation.y = Math.atan2(direction.x, direction.z);
                }
            }
        }

        this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, this.targetRotation.y, 0.1);

        this.boundingBox.setFromObject(this.mesh);

        this.camera.updateRotation(this.controller, dt);
        this.camera.setup(this.mesh.position, this.rotationVector);
        this.detectEnvironmentCollision(this.boundingBox, this.scene);
    }
    
    detectEnvironmentCollision(playerBoundingBox, scene) {
        scene.children.forEach((child) => {
            if (child.type === "env") {
                const envHitbox = child.userData.hitbox;

                if (playerBoundingBox.intersectsBox(envHitbox)) {
                    console.log("Collision detected");
                    this.mesh.position.y = 0;
                    this.controller.key['forward'] = false; 
                    this.controller.key['backward'] = false; 
                    this.controller.key['left'] = false; 
                    this.controller.key['right'] = false; 
                }
            }
        });
    }
}

export class PlayerController {
    constructor() {
        this.key = {
            "forward": false,
            "backward": false,
            "left": false,
            "right": false,
            "rotateUp": false,
            "rotateDown": false,
            "rotateLeft": false,
            "rotateRight": false,
            "zoom": 0,
            "toggleCamera": false
        };
        this.mousePos = new THREE.Vector2();
        this.mouseDown = false;
        this.deltaMousePos = new THREE.Vector2();

        document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
        document.addEventListener("keyup", (e) => this.onKeyUp(e), false);

        document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
        document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
        document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
        document.addEventListener("wheel", (e) => this.onMouseWheel(e), false);
        document.addEventListener("click", () => this.onPointerLockChange(), false);
        document.addEventListener("pointerlockchange", () => this.onPointerLockChange(), false);
        document.addEventListener("pointerlockerror", () => console.error("Pointer Lock Error"), false);
    }

    onMouseWheel(event) {
        const zoomSpeed = 0.001;
        this.key["zoom"] -= event.deltaY * zoomSpeed;
    }

    onMouseMove(event) {
        if (document.pointerLockElement) {
            this.deltaMousePos.x = event.movementX;
            this.deltaMousePos.y = event.movementY;
        }
    }

    onMouseDown(event) {
        this.mouseDown = true;
        document.body.requestPointerLock();
    }

    onMouseUp(event) {
        this.mouseDown = false;
        this.deltaMousePos.set(0, 0);
        document.exitPointerLock();
    }

    onPointerLockChange() {
        if (document.pointerLockElement) {
            this.mouseDown = true;
        } else {
            this.mouseDown = false;
            this.deltaMousePos.set(0, 0);
        }
    }

    onKeyDown(event) {
        switch (event.key) {
            case "W":
            case "w": this.key["forward"] = true; break;
            case "S":
            case "s": this.key["backward"] = true; break;
            case "A":
            case "a": this.key["left"] = true; break;
            case "D":
            case "d": this.key["right"] = true; break;
            case "I":
            case "i": this.key["rotateUp"] = true; break;
            case "K":
            case "k": this.key["rotateDown"] = true; break;
            case "J":
            case "j": this.key["rotateLeft"] = true; break;
            case "L":
            case "l": this.key["rotateRight"] = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.key) {
            case "W":
            case "w": this.key["forward"] = false; break;
            case "S":
            case "s": this.key["backward"] = false; break;
            case "A":
            case "a": this.key["left"] = false; break;
            case "D":
            case "d": this.key["right"] = false; break;
            case "I":
            case "i": this.key["rotateUp"] = false; break;
            case "K":
            case "k": this.key["rotateDown"] = false; break;
            case "J":
            case "j": this.key["rotateLeft"] = false; break;
            case "L":
            case "l": this.key["rotateRight"] = false; break;
        }
    }
}


export class ThirdPersonCamera {
    constructor(camera, positionOffset, targetOffset) {
        this.camera = camera;
        this.positionOffset = positionOffset;
        this.targetOffset = targetOffset;
        this.rotationAngle = new THREE.Vector3(0, 0, 0);
        this.zoomLevel = 1;
        this.targetZoomLevel = 1;

        // Set the camera's up vector to prevent unintended roll
        this.camera.up.set(0, 1, 0);
    }

    updateRotation(controller, dt) {
        const rotationSpeed = 1;

        if (controller.key["rotateUp"]) {
            this.rotationAngle.z -= rotationSpeed * dt;
        }
        if (controller.key["rotateDown"]) {
            this.rotationAngle.z += rotationSpeed * dt;
        }
        if (controller.key["rotateLeft"]) {
            this.rotationAngle.y += rotationSpeed * dt;
        }
        if (controller.key["rotateRight"]) {
            this.rotationAngle.y -= rotationSpeed * dt;
        }

        // Adjust target zoom level
        if (controller.key["zoom"]) {
            this.targetZoomLevel -= controller.key["zoom"];
            this.targetZoomLevel = Math.max(0.1, Math.min(10, this.targetZoomLevel));
            controller.key["zoom"] = 0; // Reset zoom input
        }

        // Update rotation based on mouse movements
        if (controller.mouseDown && document.pointerLockElement) {
            const mouseSpeed = 0.002;
            this.rotationAngle.y -= controller.deltaMousePos.x * mouseSpeed;
            this.rotationAngle.x -= controller.deltaMousePos.y * mouseSpeed;

            // Clamp the vertical rotation angle to prevent flipping
            this.rotationAngle.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationAngle.x));

            // Reset delta mouse position after applying it
            controller.deltaMousePos.set(0, 0);
        }
    }

    setup(target, angle) {
        // Smoothly transition zoom level
        this.zoomLevel = THREE.MathUtils.lerp(this.zoomLevel, this.targetZoomLevel, 0.1);

        var temp = new THREE.Vector3();
        temp.copy(this.positionOffset);
        temp.multiplyScalar(this.zoomLevel);

        // Apply the rotation around the Y axis
        temp.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.y + this.rotationAngle.y);

        // Create a quaternion for the X axis rotation
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.rotationAngle.z);

        // Rotate the temp vector by the quaternion
        temp.applyQuaternion(quaternion);

        temp.addVectors(target, temp);
        this.camera.position.copy(temp);

        temp = new THREE.Vector3();
        temp.addVectors(target, this.targetOffset);
        this.camera.lookAt(temp);
    }
}

