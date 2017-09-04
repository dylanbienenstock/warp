module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityTracker extends EntityBase {
		constructor(data) {
			super(data);

			this.lifespan = data.lifespan || 3000;
			this.networkGlobally = true;

			this.angle = data.angle || 0;
			this.speed = data.speed || 0;
 
			this.ownerId = data.ownerId;
			this.trackFactor = data.trackFactor || 0.0625;
			this.damage = data.damage || 10;
			this.radius = data.radius || 6;
			this.color = data.color || 0xFF0000;
			this.x = data.x;
			this.y = data.y;
			this.initialSpeedMult = data.initialSpeedMult || 2;

			var owner = ENT.getPlayerById(this.ownerId);
			var velocityX = 0;
			var velocityY = 0;

			if (owner != undefined) {
				velocityX = -Math.cos(data.angle) * data.speed * this.initialSpeedMult + owner.physicsObject.totalVelocityX / 2;
				velocityY = -Math.sin(data.angle) * data.speed * this.initialSpeedMult + owner.physicsObject.totalVelocityY / 2;
			}

			this.physicsObject = PHYS.new("Circle", {
				collisionGroup: "Projectile",
				x: this.x,
				y: this.y,
				radius: this.radius,
				velocityX: velocityX,
				velocityY: velocityY,
				thrustX: -Math.cos(this.angle) * this.speed,
				thrustY: -Math.sin(this.angle) * this.speed
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

		update() {
			if (this.ownerId != undefined) {
				var owner = ENT.getPlayerById(this.ownerId);

				if (owner != undefined && owner.lockOnPosition != undefined) {
					var destAngle = Math.atan2(this.physicsObject.y - owner.lockOnPosition.y, this.physicsObject.x - owner.lockOnPosition.x);
	
					this.angle = this.lerpAngle(this.angle, destAngle, this.trackFactor);
					this.physicsObject.thrustX = -Math.cos(this.angle) * this.speed;
					this.physicsObject.thrustY = -Math.sin(this.angle) * this.speed;
				}
			}
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		network() {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y
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

			if (entity instanceof ENT.type("Planet") || entity instanceof ENT.type("Asteroid")) {
				var velocity = (entity instanceof ENT.type("Planet") ? 16 : 64);

				entity.physicsObject.velocityX += this.physicsObject.totalVelocityX / velocity;
				entity.physicsObject.velocityY += this.physicsObject.totalVelocityY / velocity;

				ENT.remove(this);
			}
		}
	}
}