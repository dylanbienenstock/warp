module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityLaser extends EntityBase {
		constructor(data) {
			super(data);

			this.lifespan = data.lifespan || 1000;
			this.networkGlobally = true;

			this.ownerId = data.ownerId;
			this.damage = data.damage || 10;
			this.thickness = data.thickness || 2;
			this.color = data.color || 0xFF0000;
			this.length = data.length || 64;
			this.x = data.x;
			this.y = data.y;
			this.rotation = data.rotation;

			this.physicsObject = PHYS.new("Box", {
				collisionGroup: "Projectile",
				x: data.x,
				y: data.y,
				localX: -this.length,
				localY: -9,
				width: this.length,
				height: 18,
				rotation: data.rotation,
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