var PHYS;

module.exports = function(__PHYS) {
	PHYS = __PHYS;

	return class PhysicsBase {
		constructor(data) {
			this.doNotNetwork = true;
			this.id = -1;
			this.active = data.active;
			this.sleeping = false;
			this.collisionGroup = data.collisionGroup;
			this.x = data.x || 0;
			this.y = data.y || 0;
			this.lastX = this.x;
			this.lastY = this.y;
			this.localX = data.localX || 0;
			this.localY = data.localY || 0;
			this.thrustX = data.thrustX || 0;
			this.thrustY = data.thrustY || 0;
			this.restrictToMap = data.restrictToMap;
			this.restrictX = 0;
			this.restrictY = 0;
			this.velocityX = data.velocityX || 0;
			this.velocityY = data.velocityY || 0;
			this.children = [];

			if (this.active == undefined) {
				this.active = true;
			}
		}

		get totalVelocityX() {
			return this.velocityX + this.thrustX + this.restrictX;
		}

		get totalVelocityY() {
			return this.velocityY + this.thrustY + this.restrictY;
		}

		addChild(child) {
			this.children.push(child);
		}

		distanceTo(x, y) {
			return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
		}
	}
}