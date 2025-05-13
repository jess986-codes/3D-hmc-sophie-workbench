export function setupResizeHandler(sizes, camera, renderer) {
	window.addEventListener("resize", (event) => {
		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;

		camera.aspect = sizes.width / sizes.height;
		camera.updateProjectionMatrix();

		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	});
}
