import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { setupResizeHandler } from "./scripts/listeners.js";
import { loadingManager } from "./scripts/loadingManager.js";
import {
	moveThread,
	threadAnimationState,
} from "./scripts/animations/threadAnimation.js";

import MoveAnimation from "./scripts/animations/moveAnimation.js";

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
const canvas = document.querySelector("canvas.webgl-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#E7D0BD");

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height);
camera.position.set(9.192478577573674, 5.141617189684073, 7.67861904910377);
scene.add(camera);

// get correct asset path based on environment
function getAssetPath(relativePath) {
	const base = import.meta.env.BASE_URL || ""; // Vite provides this environment variable
	return `${base}${relativePath}`;
}

// baked texture loader
const textureLoader = new THREE.TextureLoader(loadingManager);
const textureMap = {
	one: getAssetPath("images/textures/workbench/TextureOne.webp"),
	two: getAssetPath("images/textures/workbench/TextureTwo.webp"),
	three: getAssetPath("images/textures/workbench/TextureThree.webp"),
	four: getAssetPath("images/textures/workbench/TextureFour.webp"),
	five: getAssetPath("images/textures/workbench/TextureFive.webp"),
};

const loadedTextures = {};
Object.entries(textureMap).forEach(([key, path]) => {
	const texture = textureLoader.load(path);
	texture.flipY = false;
	texture.colorSpace = THREE.SRGBColorSpace;
	loadedTextures[key] = texture;
});

// transparent texture
const environmentMap = new THREE.CubeTextureLoader().setPath(
	getAssetPath("images/textures/skybox/")
);
textureLoader.load([
	getAssetPath("images/textures/skybox/px.webp"),
	getAssetPath("images/textures/skybox/nx.webp"),
	getAssetPath("images/textures/skybox/py.webp"),
	getAssetPath("images/textures/skybox/ny.webp"),
	getAssetPath("images/textures/skybox/pz.webp"),
	getAssetPath("images/textures/skybox/nz.webp"),
]);

const glassMaterial = new THREE.MeshPhysicalMaterial({
	attenuationColor: "yellow",
	transmission: 1,
	opacity: 1,
	metalness: 0,
	roughness: 0,
	ior: 1.5,
	thickness: 0.01,
	specularIntensity: 1,
	envMapIntensity: 1,
	envMap: environmentMap,
	depthWrite: false,
	lightMapIntensity: 1,
});

const sunRayMaterial = new THREE.MeshPhysicalMaterial({
	color: "#e9e795",
	emissive: "#eecbaa",
	transparent: true,
	opacity: 0.15,
});

// model loaders
const gltfLoader = new GLTFLoader(loadingManager);
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath(getAssetPath("draco/"));
gltfLoader.setDRACOLoader(dracoLoader);

const imageMaterial = textureLoader.load(
	getAssetPath("images/pictures/sophie-and-howl.avif")
);
imageMaterial.wrapS = THREE.RepeatWrapping;
imageMaterial.wrapT = THREE.RepeatWrapping;
imageMaterial.repeat.set(4, 4);

let windowObject;
let hatObject;
let sunraysObject;
let bookObject;
let threadObject;
let drawerObject;
const drawerGroup = new THREE.Group();
const drawerMeshes = [];
const raycasterObjects = [];
gltfLoader.load(getAssetPath("models/workbench-model.glb"), (model) => {
	model.scene.traverse((child) => {
		if (child.isMesh) {
			if (child.name.includes("glass")) {
				child.material = glassMaterial;
			} else if (child.name.includes("sunrays")) {
				child.material = sunRayMaterial;
				sunraysObject = child;
			} else if (child.name.includes("picture")) {
				child.material = imageMaterial;
			} else {
				Object.keys(textureMap).forEach((key) => {
					if (child.name.toLowerCase().includes(key)) {
						const material = new THREE.MeshBasicMaterial({
							map: loadedTextures[key],
						});
						child.material = material;

						if (child.material.map) {
							child.material.map.minFilter = THREE.LinearFilter;
						}
					}
				});
			}

			if (child.name.includes("window_light")) {
				windowObject = child;
			}

			if (child.name.includes("hat")) {
				hatObject = child;
			}

			if (child.name.includes("book")) {
				const bookInitialPosition = child.position.clone();
				const bookFinalPosition = new THREE.Vector3(
					bookInitialPosition.x,
					bookInitialPosition.y,
					bookInitialPosition.z + 0.3
				);

				bookObject = new MoveAnimation(
					child,
					bookInitialPosition,
					bookFinalPosition
				);
			}

			if (child.name.includes("thread")) {
				threadObject = child;
				threadObject.userData.initialPosition =
					threadObject.position.clone();
				threadObject.userData.finalPosition = new THREE.Vector3(
					threadObject.userData.initialPosition.x + 0.1,
					threadObject.userData.initialPosition.y,
					threadObject.userData.initialPosition.z + 0.1
				);
			}

			if (
				child.name.includes("drawer") ||
				child.name.includes("target_6") ||
				child.name.includes("target_7")
			) {
				drawerMeshes.push(child);
			}

			if (child.name.includes("target")) {
				raycasterObjects.push(child);
			}
		}
	});

	drawerMeshes.forEach((mesh) => drawerGroup.add(mesh));
	const drawerInitialPosition = drawerGroup.position.clone();
	const drawerFinalPosition = new THREE.Vector3(
		drawerInitialPosition.x,
		drawerInitialPosition.y,
		drawerInitialPosition.z - 0.39
	);
	drawerObject = new MoveAnimation(
		drawerGroup,
		drawerInitialPosition,
		drawerFinalPosition
	);

	scene.add(model.scene);
	scene.add(drawerGroup);
});

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1;
controls.maxDistance = 20;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.update();
controls.target.set(
	-0.05454917167656999,
	1.3365694143010431,
	-0.659865346643258
);

// raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const onPointerClick = (event) => {
	pointer.x = (event.clientX / sizes.width) * 2 - 1;
	pointer.y = -(event.clientY / sizes.height) * 2 + 1;

	raycaster.setFromCamera(pointer, camera);
	const intersects = raycaster.intersectObjects(raycasterObjects);
	if (intersects.length > 0) {
		const objectName = intersects[0].object.name;
		console.log(objectName);
		if (objectName.includes("book") && !bookObject.isAnimating) {
			bookObject.moveObject();
		}

		if (objectName.includes("drawer") && !drawerObject.isAnimating) {
			drawerObject.moveObject();
		}
	}
};

// listeners
setupResizeHandler(sizes, camera, renderer);
window.addEventListener("mousedown", onPointerClick);

const renderLoop = () => {
	if (threadObject && !threadAnimationState.isAnimating) {
		moveThread(threadObject);
	}

	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(renderLoop);
};

renderLoop();

let lightMode = true;
const themeToggle = document.querySelector(".btn.theme-toggle");
themeToggle.addEventListener("click", () => {
	themeToggle.classList.toggle("dark-theme");
	lightMode = !lightMode;

	if (windowObject) {
		windowObject.visible = lightMode;
		sunraysObject.visible = lightMode;
	}
});
