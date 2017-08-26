module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityShield extends EntityBase {
		constructor(data) {
			super(data);

			this.doNotNetwork = true;
			this.ownerId = data.ownerId;
			this.radius = data.radius || 32;
			this.hitSize = data.hitSize || data.radius || 32;
			this.damageFactor = 0.5;
			this.power = 100;

			this.physicsObject = PHYS.new("Circle", {
				radius: this.radius
			});
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		takeDamage(damage, entity, collision) {
			if (this.ownerId != undefined) {
				var owner = ENT.getById(this.ownerId);

				if (owner != undefined) {
					var angleDegrees = (collision.angle - owner.physicsObject.rotation) * (180 / Math.PI);
					angleDegrees = ((angleDegrees % 360) + 360) % 360;
					damage *= this.damageFactor;
					damage = Math.max(damage, 0);

					this.power -= damage;

					if (this.power < 0) {
						var hullDamage = -this.power;
						this.power = 0;

						return hullDamage;
					}
				}
			}

			ENT.trigger(this, "hit", {
				angle: collision.angle,
				position: collision.position
			});

			return 0;
		}

		update(timeMult) {
			if (this.ownerId != undefined) {
				var owner = ENT.getById(this.ownerId);

				if (owner != undefined) {
					this.physicsObject.x = owner.physicsObject.info.bounds.center.x + this.physicsObject.totalVelocityX;
					this.physicsObject.y = owner.physicsObject.info.bounds.center.y + this.physicsObject.totalVelocityY;
				}

				this.power = Math.min(this.power + 0.1 * timeMult, 100);
			}
		}

		network() {
			ENT.sendProperties(this, {
				power: this.power,
				hits: this.hits
			});
		}
	}
}