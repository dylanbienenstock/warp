module.exports = function(EntityBase, ENT, PHYS) {
	return class EntitySticky extends EntityBase {
		constructor(data) {
			super(data);

			this.lifespan = data.lifespan || 1000;

			this.ownerId = data.ownerId;
			this.damage = data.damage || 10;
			this.radius = data.radius || 4;

			this.x = data.x;
			this.y = data.y;
			
			this.physicsObject = PHYS.new("Circle", {
				collisionGroup: "Projectile",
				x: data.x,
				y: data.y,
				radius: data.radius,
				localX: 0,
				localY: 0,
				thrustX: data.thrustX,
				thrustY: data.thrustY
			});
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