module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityAsteroid extends EntityBase {
		constructor(data) {
			super(data);

			this.radius = Math.random() * 16 + 32;
			this.health = 150 * (this.radius / (16 + 32));
			this.initialHealth = this.health;
			this.alive = true;
			this.respawnTimeout = null;

			if (Math.random() > 0.95) {
				this.radius = 72;
				this.health = 250;
			}

			this.physicsObject = PHYS.new("Circle", {
				restrictToMap: true,
				radius: this.radius + 8
			});

			this.resetPosition();
		}

		resetPosition() {
			var angle = 2 * Math.PI * Math.random();

			this.nextNetworkGlobally = true;

			this.physicsObject.x = -Math.cos(angle) * (PHYS.boundaryRadius / 2 + Math.random() * 1024);
			this.physicsObject.y = -Math.sin(angle) * (PHYS.boundaryRadius / 2 + Math.random() * 1024);

			clearTimeout(this.respawnTimeout);
			setTimeout(this.respawn.bind(this), 5000);
		}

		respawn() {
			this.nextNetworkGlobally = true;

			this.alive = true;
			this.health = this.initialHealth;
			this.physicsObject.active = true;
		}

		dropCredits() {
			if (this.alive) {
				ENT.create(ENT.new("Credits", {
					x: this.physicsObject.x,
					y: this.physicsObject.y,
					amount: this.radius * 5
				}));
			}
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		update(timeMult) {
			super.update();
		}

		collideWith(entity, collision) {
			if (entity instanceof ENT.type("Asteroid")) {
				var velocity = 0.1;
				var angle = Math.atan2(entity.physicsObject.y - this.physicsObject.y, entity.physicsObject.x - this.physicsObject.x);

				this.physicsObject.velocityX += -Math.cos(angle) * 0.1;
				this.physicsObject.velocityY += -Math.sin(angle) * 0.1;
			}

			if (entity instanceof ENT.type("Laser") || entity instanceof ENT.type("Tracker")) {
				ENT.trigger(this, "hit");
				ENT.remove(entity);

				this.health -= entity.damage;
				
				if (this.health <= 0) {
					this.dropCredits();
					this.alive = false;
					this.physicsObject.active = false;

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