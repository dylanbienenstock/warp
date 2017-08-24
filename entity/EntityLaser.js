module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityLaser extends EntityBase {
		constructor(data) {
			super("Laser");

			this.lifespan = 3000;

			this.ownerId = data.ownerId;
			this.x = data.x;
			this.y = data.y;
			this.rotation = data.rotation;

			this.physicsObject = new PHYS.PhysicsObject({
				x: data.x,
				y: data.y,
				localX: -12,
				localY: -4,
				width: 24,
				height: 8,
				rotation: data.rotation,
				thrustX: data.thrustX,
				thrustY: data.thrustY
			});
		}

		create() {
			if (this.physicsObject != undefined && this.physicsObject != null) {
				PHYS.create(this, this.physicsObject);
			}
		}

		network() {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y
			});
		}

		collideWith(entity) {
			if (entity instanceof ENT.type("Player") && entity.id != this.ownerId) {
				entity.physicsObject.velocityX = this.physicsObject.thrustX / 3;
				entity.physicsObject.velocityY = this.physicsObject.thrustY / 3;

				ENT.remove(this);
			}
		}
	}
}