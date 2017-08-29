module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityAsteroid extends EntityBase {
		constructor(data) {
			super(data);

			this.radius = Math.random() * 16 + 32;
			this.health = 150 * (this.radius / (16 + 32));
			this.alive = true;

			if (Math.random() > 0.95) {
				this.radius = 72;
				this.health = 250;
			}

			this.physicsObject = PHYS.new("Circle", {
				restrictToMap: true,
				radius: this.radius
			});

			this.resetPosition();
		}

		resetPosition() {
			var angle = 2 * Math.PI * Math.random();

			this.nextNetworkGlobally = true;

			this.physicsObject.x = -Math.cos(angle) * (PHYS.boundaryRadius / 2 + Math.random() * 128);
			this.physicsObject.y = -Math.sin(angle) * (PHYS.boundaryRadius / 2 + Math.random() * 128);
			this.physicsObject.velocityX = -Math.cos(angle) * 2;
			this.physicsObject.velocityY = -Math.sin(angle) * 2;

			setTimeout(this.respawn.bind(this), 5000);
		}

		respawn() {
			this.nextNetworkGlobally = true;

			this.alive = true;
			this.physicsObject.active = true;
		}

		dropCredits() {

		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		update(timeMult) {
			super.update();
		}

		collideWith(entity, collision) {
			if (entity instanceof ENT.type("Asteroid")) {
				var distance = this.physicsObject.distanceTo(entity.physicsObject.x, entity.physicsObject.y);
				var velocity = (entity.radius / this.radius) * (this.radius + entity.radius - distance) * 0.05 + 0.025;

				this.physicsObject.velocityX += -Math.cos(collision.angle) * velocity;
				this.physicsObject.velocityY += -Math.sin(collision.angle) * velocity;
			}

			if (entity instanceof ENT.type("Laser")) {
				ENT.trigger(this, "hit");

				this.health -= entity.damage;
				
				if (this.health <= 0) {
					this.alive = false;
					this.physicsObject.active = false;

					this.dropCredits();

					setTimeout(this.resetPosition.bind(this), 5000);
				}
			}
		}

		network() {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y,
				alive: this.alive
			});
		}
	}
}