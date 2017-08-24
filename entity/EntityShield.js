module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityShield extends EntityBase {
		constructor(data) {
			super("Shield");

			this.doNotNetwork = true;
			this.ownerId = data.ownerId;
			this.radius = 32;
			this.damageFactor = 1;
			this.power = {
				front: 100,
				back: 100,
				left: 100,
				right: 100
			}
		}

		takeDamage(damage, collision) {
			var angleDegrees = collision.angle * (180 / Math.PI);
			angleDegrees = ((angleDegrees % 360) + 360) % 360;

			damage *= this.damageFactor;
			damage = Math.max(damage, 0);

			var side;

			if (angleDegrees >= 315 || angleDegrees < 45) {
				side = "front";
			} 
			else if (angleDegrees >= 45 && angleDegrees < 135) {
				side = "right";
			} 
			else if (angleDegrees >= 135 && angleDegrees < 225) {
				side = "back";
			}
			else if (angleDegrees >= 225 && angleDegrees < 315) {
				side = "left";
			}

			this.power[side] -= damage;

			if (this.power[side] < 0) {
				var hullDamage = -this.power[side];
				this.power[side] = 0;

				return hullDamage;
			}

			ENT.trigger(this, "hit", {
				angle: collision.angle,
				position: collision.position
			});

			return 0;
		}

		update(timeMult) {
			this.power.front = Math.min(this.power.front + 0.1 * timeMult, 100);
			this.power.back = Math.min(this.power.back + 0.1 * timeMult, 100);
			this.power.left = Math.min(this.power.left + 0.1 * timeMult, 100);
			this.power.right = Math.min(this.power.right + 0.1 * timeMult, 100);
		}

		network() {
			ENT.sendProperties(this, {
				power: this.power,
				hits: this.hits
			});
		}
	}
}