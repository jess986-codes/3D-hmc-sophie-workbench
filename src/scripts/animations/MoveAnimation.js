import { gsap } from "gsap";

export default class MoveAnimation {
	constructor(mesh, initialPosition, finalPosition) {
		this.object = mesh;
		this.initialPosition = initialPosition;
		this.finalPosition = finalPosition;
		this.isAnimating = false;
		this.hasMoved = false;
	}

	moveObject() {
		this.isAnimating = true;
		const targetPosition = this.hasMoved
			? this.initialPosition
			: this.finalPosition;

		gsap.to(this.object.position, {
			x: targetPosition.x,
			y: targetPosition.y,
			z: targetPosition.z,
			duration: 0.5,
			ease: "power2.out",
			onComplete: () => {
				this.isAnimating = false;
				this.hasMoved = !this.hasMoved;
			},
		});
	}
}
