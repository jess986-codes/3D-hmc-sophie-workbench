import { gsap } from "gsap";

const threadAnimationState = {
	isAnimating: false,
	isThreadOut: false,
};

export function moveThread(threadObj) {
	threadAnimationState.isAnimating = true;
	const targetPosition = threadAnimationState.isThreadOut
		? threadObj.userData.initialPosition
		: threadObj.userData.finalPosition;

	gsap.to(threadObj.position, {
		x: targetPosition.x,
		y: targetPosition.y,
		z: targetPosition.z,
		duration: 5,
		ease: "sine.out",
		onComplete: () => {
			setTimeout(() => {
				threadAnimationState.isAnimating = false;
				threadAnimationState.isThreadOut =
					!threadAnimationState.isThreadOut;
			}, 500);
		},
	});
}

export { threadAnimationState };
