module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityLaser extends EntityBase {
		constructor(data) {
			super("Laser");

			this.lifespan = 1000;

			this.ownerId = data.ownerId;
			this.thickness = data.thickness || 2;
			this.color = data.color || 0xFF0000;
			this.x = data.x;
			this.y = data.y;
			this.rotation = data.rotation;

			this.physicsObject = PHYS.new("Box", {
				x: data.x,
				y: data.y,
				localX: -48,
				localY: -4,
				width: 48,
				height: 8,
				rotation: data.rotation,
				thrustX: data.thrustX,
				thrustY: data.thrustY
			});
		}

		create() {
			if (this.physicsObject != undefined && this.physicsObject != null) {
				PHYS.create(this, this.physicsObject);
			}
		}

		network() {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y
			});
		}

		collideWith(entity, collision) {
			if (entity instanceof ENT.type("Shield") && entity.ownerId != this.ownerId) {
				var damage = entity.takeDamage(10, this, collision);

				if (damage > 0) {
					ENT.getById(entity.ownerId, function(entity) {
						entity.takeDamage(damage, collision);
					});

					ENT.remove(this);
				}

				ENT.remove(this);
			}

			if (entity instanceof ENT.type("Player") && entity.id != this.ownerId) {
				var damage = entity.takeDamage(10, collision);

				if (damage > 0) {
					entity.physicsObject.velocityX += this.physicsObject.thrustX / 16;
					entity.physicsObject.velocityY += this.physicsObject.thrustY / 16;
				}

				ENT.remove(this);
			}
		}
	}
}