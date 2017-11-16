module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityAsteroid extends EntityBase {
		constructor(data) {
			super(data);

			this.networkGlobally = true;
			this.canTakeDamage = true;

			this.radius = Math.floor(Math.random() * 16 + 32);
			this.health = Math.floor(150 * (this.radius / (16 + 32)));
			this.initialHealth = this.health;
			this.respawnTimeout = null;

			if (Math.random() > 0.95) {
				this.radius = 72;
				this.health = 250;
			}

			this.physicsObject = PHYS.new("Circle", {
				restrictToMap: true,
				radius: this.radius + 8
			});

			this.orbitEntityId = data.orbitEntityId;
			this.orbitInitialRadius = data.orbitInitialRadius;
			this.orbitFieldRadius = data.orbitFieldRadius;
			this.orbitRadius = null;
			this.orbitOffset = null;
			this.orbitSpeedDivisor = data.orbitSpeedDivisor;

			this.orbitOffsetX = 0;
			this.orbitOffsetY = 0;
		}

		resetPosition() {
			if (this.orbitEntityId != undefined) {
				ENT.getById(this.orbitEntityId, function(orbitEntity) {
					var angle = 2 * Math.PI * Math.random();
					var distance = this.orbitInitialRadius + this.orbitFieldRadius * Math.random();

					this.orbitOffsetX = Math.cos(angle) * distance;
					this.orbitOffsetY = Math.sin(angle) * distance;
					this.physicsObject.x = orbitEntity.physicsObject.x + this.orbitOffsetX;
					this.physicsObject.y = orbitEntity.physicsObject.y + this.orbitOffsetY;
				}.bind(this));
			}

			clearTimeout(this.respawnTimeout);
			setTimeout(this.respawn.bind(this), 5000);
		}

		respawn() {
			this.alive = true;
			this.health = this.initialHealth;
			this.physicsObject.active = true;
		}

		dropCredits() {
			ENT.create(ENT.new("Credits", {
				x: this.physicsObject.x,
				y: this.physicsObject.y,
				amount: this.radius * 5
			}));
		}

		create() {
			PHYS.create(this, this.physicsObject);
			this.resetPosition();
		}

		update(timeMult) {
			super.update();

			// Orbit
			if (this.orbitEntityId != undefined) {
				ENT.getById(this.orbitEntityId, function(orbitEntity) {
					if (orbitEntity.physicsObject != undefined) {
						var distance = this.physicsObject.distanceTo(orbitEntity.physicsObject.x, orbitEntity.physicsObject.y) - 1;
						var angle = Math.atan2(this.physicsObject.y - orbitEntity.physicsObject.y, this.physicsObject.x - orbitEntity.physicsObject.x);

						this.orbitOffsetX += this.physicsObject.totalVelocityX;
						this.orbitOffsetY += this.physicsObject.totalVelocityY;
						this.physicsObject.x = orbitEntity.physicsObject.x + this.orbitOffsetX;
						this.physicsObject.y = orbitEntity.physicsObject.y + this.orbitOffsetY;

						if (distance < this.orbitInitialRadius + 64) {
							this.orbitOffsetX += Math.cos(angle) * 0.1;
							this.orbitOffsetY += Math.sin(angle) * 0.1;
						} else if (distance > this.orbitInitialRadius + this.orbitFieldRadius - 64) {
							this.orbitOffsetX -= Math.cos(angle) * 0.1;
							this.orbitOffsetY -= Math.sin(angle) * 0.1;
						}
					}
				}.bind(this));
			}
		}

		collideWith(entity, collision) {
			if (entity instanceof ENT.type("Asteroid") || entity instanceof ENT.type("Planet") || entity instanceof ENT.type("Credits")) {
				var velocity = 0.1;
				var angle = Math.atan2(this.physicsObject.y - entity.physicsObject.y, this.physicsObject.x - entity.physicsObject.x);

				this.physicsObject.velocityX += Math.cos(angle) * 0.1;
				this.physicsObject.velocityY += Math.sin(angle) * 0.1;
			}
		}

		takeDamage(amount, entity, collision, override) {
			super.takeDamage(amount, entity, collision, override);

			ENT.trigger(this, "hit");

			if (entity != undefined && entity.physicsObject != undefined) {
				this.physicsObject.velocityX += entity.physicsObject.totalVelocityX / 48;
				this.physicsObject.velocityY += entity.physicsObject.totalVelocityY / 48;
			}
		}

		killed(attackerId) {
			this.dropCredits();
			this.physicsObject.active = false;
			setTimeout(this.resetPosition.bind(this), 5000);
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