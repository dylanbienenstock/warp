module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlanet extends EntityBase {
		constructor(data) {
			super(data);

			this.radius = data.radius || 64;
			this.color = data.color || 0xFF6010;

			this.physicsObject = PHYS.new("Circle", {
				restrictToMap: true,
				x: this.x,
				y: this.y,
				radius: this.radius
			});
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		update(timeMult) {
			super.update();
		}

		collideWith(entity, collision) {
			if (entity instanceof ENT.type("Planet")) {
				var distance = this.physicsObject.distanceTo(entity.physicsObject.x, entity.physicsObject.y);
				var velocity = (entity.radius / this.radius) * (this.radius + entity.radius - distance) * 0.05 + 0.025;

				this.physicsObject.velocityX += -Math.cos(collision.angle) * velocity;
				this.physicsObject.velocityY += -Math.sin(collision.angle) * velocity;
			}
		}

		network() {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y
			});
		}
	}
}