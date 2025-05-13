import { LoadingManager } from "three";

const loadingManager = new LoadingManager();

const progressBar = document.querySelector(".progress-bar");
const loadingText = document.querySelector(".loading-text");
const loadingScreen = document.querySelector(".loading-screen");

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
	const progress = (itemsLoaded / itemsTotal) * 100;
	progressBar.style.width = progress + "%";
	loadingText.textContent = `Loading: ${Math.round(
		progress
	)}% ${itemsLoaded}/${itemsTotal}`;
};

loadingManager.onLoad = () => {
	loadingText.textContent = "Starting scene...";

	setTimeout(() => {
		loadingScreen.classList.add("hidden");
	}, 500);
};

loadingManager.onError = (url) => {
	loadingText.textContent =
		"Error loading assets. Please refresh the page TT TT";
};

export { loadingManager };
