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
				this.physicsObject.velocityX += -Math.cos(collision.angle) * 0.1;
				this.physicsObject.velocityY += -Math.sin(collision.angle) * 0.1;
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