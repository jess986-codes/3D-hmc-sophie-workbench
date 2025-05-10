import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import "./style.scss";
import * as THREE from "three";

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
const canvas = document.querySelector("canvas.webgl-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#E7D0BD");

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 5;
scene.add(camera);

// baked texture loader
const textureLoader = new THREE.TextureLoader();
const textureMap = {
	one: "/textures/workbench/TextureOne.webp",
	two: "/textures/workbench/TextureTwo.webp",
	three: "/textures/workbench/TextureThree.webp",
	four: "/textures/workbench/TextureFour.webp",
	five: "/textures/workbench/TextureFive.webp",
};

const loadedTextures = {};
Object.entries(textureMap).forEach(([key, path]) => {
	const texture = textureLoader.load(path);
	texture.flipY = false;
	texture.colorSpace = THREE.SRGBColorSpace;
	loadedTextures[key] = texture;
});

// transparent texture
const environmentMap = new THREE.CubeTextureLoader()
	.setPath("/textures/skybox/")
	.load([
		"/textures/skybox/px.webp",
		"/textures/skybox/nx.webp",
		"/textures/skybox/py.webp",
		"/textures/skybox/ny.webp",
		"/textures/skybox/pz.webp",
		"/textures/skybox/nz.webp",
	]);

const glassMaterial = new THREE.MeshPhysicalMaterial({
	attenuationColor: "0xffff00",
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

// model loaders
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("/models/workbench-model.glb", (model) => {
	model.scene.traverse((child) => {
		if (child.isMesh) {
			if (child.name.includes("glass") || child.name.includes("rays")) {
				child.material = glassMaterial;
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
		}
		scene.add(model.scene);
	});
});

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const loop = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(loop);
};

loop();
