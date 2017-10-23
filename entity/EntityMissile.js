module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityMissile extends EntityBase {
		constructor(data) {
			super(data);

			this.lifespan = data.lifespan || 3000;

			this.angle = data.angle || 0;
			this.speed = 0;
 
			this.ownerId = data.ownerId;
			this.trackFactor = 0;
			this.damage = data.damage || 30;
			this.x = data.x;
			this.y = data.y;

			var owner = ENT.getById(this.ownerId);
			var velocityX = 0;
			var velocityY = 0;

			if (owner != undefined) {
				velocityX = -Math.cos(data.angle) * 8 + owner.physicsObject.totalVelocityX / 2;
				velocityY = -Math.sin(data.angle) * 8 + owner.physicsObject.totalVelocityY / 2;
			}

			this.physicsObject = PHYS.new("Box", {
				collisionGroup: "Projectile",
				x: this.x,
				y: this.y,
				localX: -56,
				localY: -9,
				width: 56,
				height: 18,
				velocityX: velocityX,
				velocityY: velocityY,
				rotation: this.angle
			});
		}

		// From utils.js
		shortAngleDist(a0, a1) {
		    var max = Math.PI*2;
		    var da = (a1 - a0) % max;
		    return 2 * da % max - da;
		}

		// From utils.js
		lerpAngle(a0, a1, t) {
		    return a0 + this.shortAngleDist(a0, a1) * t;
		}

		update(timeMult) {
			this.speed = Math.min(this.speed + 1 * timeMult, 20);
			this.trackFactor = this.speed * 0.005;

			if (this.ownerId != undefined) {
				var owner = ENT.getById(this.ownerId);

				if (owner != undefined && owner.lockOnPosition != undefined) {
					var destAngle = Math.atan2(this.physicsObject.y - owner.lockOnPosition.y, this.physicsObject.x - owner.lockOnPosition.x);
					this.angle = this.lerpAngle(this.angle, destAngle, this.trackFactor);
					this.physicsObject.rotation = this.angle;
				}
	
				this.physicsObject.thrustX = -Math.cos(this.angle) * this.speed;
				this.physicsObject.thrustY = -Math.sin(this.angle) * this.speed;
			}
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		network() {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y,
				angle: this.angle
			});
		}

		collideWith(entity, collision) {
			if (entity instanceof ENT.type("Shield") && entity.ownerId != this.ownerId) {
				var damage = entity.takeDamage(this.damage, this, collision);

				if (damage > 0) {
					ENT.getById(entity.ownerId, function(player) {
						player.takeDamage(damage, collision);
					});
				}

				ENT.remove(this);
			}
		}
	}
}