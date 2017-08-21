module.exports = function() {
	return class PhysicsObject {
		constructor(x, y, localX, localY, width, height) {
			this.id = -1;
			this.x = x;
			this.y = y;
			this.localX = localX;
			this.localY = localY;
			this.thrustX = 0;
			this.thrustY = 0;
			this.velocityX = 0;
			this.velocityY = 0;
			this.rotation = 0;
			this.width = width;
			this.height = height;
			this.children = [];
			this.doNotNetwork = true;
		}

		get totalVelocityX() {
			return this.velocityX + this.thrustX;
		}

		get totalVelocityY() {
			return this.velocityY + this.thrustY;
		}

		addChild(child) {
			this.children.push(child);
		}
	}
}