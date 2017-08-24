var PHYS;

module.exports = function(__PHYS) {
	PHYS = __PHYS;

	return class PhysicsObject {
		constructor(data) {
			this.doNotNetwork = true;
			this.id = -1;
			this.x = data.x || 0;
			this.y = data.y || 0;
			this.localX = data.localX || -8;
			this.localY = data.localY || -8;
			this.thrustX = data.thrustX || 0;
			this.thrustY = data.thrustY || 0;
			this.velocityX = data.velocityX || 0;
			this.velocityY = data.velocityY || 0;
			this.rotation = data.rotation || 0;
			this.width = data.width || 16;
			this.height = data.height || 16;
			this.children = [];
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