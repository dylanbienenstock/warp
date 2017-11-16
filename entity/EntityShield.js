module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityShield extends EntityBase {
		constructor(data) {
			super(data);
			
			this.doNotNetwork = true;
			this.canTakeDamage = true;

			this.ownerId = data.ownerId;
			this.radius = data.radius || 32;
			this.showHits = data.showHits;
			this.hitSize = data.hitSize || data.radius || 32;
			this.damageFactor = data.damageFactor || 0.5;
			this.health = 100;
			this.lastDamageTime = 0;

			if (this.showHits == undefined) {
				this.showHits = true;
			}

			this.physicsObject = PHYS.new("Circle", {
				collisionGroup: "Shield",
				radius: this.radius
			});

			this.physicsObject.addChild(PHYS.new("Circle", {
				radius: this.radius / 3 * 2
			}));
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		// takeDamage(damage, entity, collision) {
		// 	if (this.ownerId != undefined) {
		// 		this.lastDamageTime = Date.now();
		// 		var owner = ENT.getById(this.ownerId);

		// 		if (owner != undefined) {
		// 			if (entity.ownerId != undefined) {
		// 				owner.offend(entity.ownerId);
		// 			}

		// 			var angleDegrees = (collision.angle - owner.physicsObject.rotation) * (180 / Math.PI);
		// 			angleDegrees = ((angleDegrees % 360) + 360) % 360;
		// 			damage *= this.damageFactor;
		// 			damage = Math.max(damage, 0);

		// 			this.power -= damage;

		// 			if (this.power < 0) {
		// 				var hullDamage = -this.power / this.damageFactor;
		// 				this.power = 0;

		// 				return hullDamage;
		// 			}
		// 		}
		// 	}

		// 	if (this.showHits) {
		// 		ENT.trigger(this, "hit", {
		// 			angle: collision.angle,
		// 			position: collision.position
		// 		});
		// 	}

		// 	return 0;
		// }

		takeDamage(amount, entity, collision, override) {
			if (super.takeDamage(amount, entity, collision, override)) {
				this.lastDamageTime = Date.now();
				var showThisHit = true;

				ENT.getById(this.ownerId, function(owner) {
					if (entity.ownerId != undefined) {
						owner.offend(entity.ownerId);
					}

					var difference = this.lastHealth - amount;

					if (difference < 0) {
						showThisHit = false;
						owner.takeDamage(-difference, entity, collision, true);
					}
				}.bind(this));

				if (collision != undefined && this.showHits && showThisHit) {
					ENT.trigger(this, "hit", {
						angle: collision.angle,
						position: collision.position
					});
				}
			}
		}

		scaleDamage(amount, entity, collision, override) {
			if (this.health > amount) {
				return amount * this.damageFactor;
			}
		}

		update(timeMult) {
			if (this.ownerId != undefined) {
				var owner = ENT.getById(this.ownerId);

				if (owner != undefined && owner.physicsObject.info != undefined) {
					this.physicsObject.x = owner.physicsObject.info.bounds.center.x + this.physicsObject.totalVelocityX;
					this.physicsObject.y = owner.physicsObject.info.bounds.center.y + this.physicsObject.totalVelocityY;
				}

				if (Date.now() - this.lastDamageTime >= 2500) {
					this.health = Math.min(this.health + 0.1 * timeMult, 100);
					this.alive = true;
				}
			}
		}

		network() {
			ENT.sendProperties(this, {
				health: this.health,
				hits: this.hits
			});
		}
	}
}