module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityBeam extends EntityBase {
		constructor(data) {
			super(data);

			this.ownerId = data.ownerId;
			this.active = false;
			this.damage = data.damage || 2;
			this.color = data.color || 0xFF0000;
			this.range = data.range || 512;
			this.width = data.width || 32;

			this.physicsObject = PHYS.new("Box", {
				collisionGroup: "Projectile",
				x: this.x,
				y: this.y,
				localX: -this.range + 16,
				localY: -this.width / 4,
				width: this.range + 16,
				height: 18
			});

			for (var i = 0; i < 8; i++) {
				this.physicsObject.addChild(PHYS.new("Box", {
					localX: (-this.range / 8) * (i + 1) + 16,
					localY: -((this.width / 8) * (i + 1)) / 2,
					width: this.range / 8,
					height: (this.width / 8) * (i + 1)
				}));
			}
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		collideWith(entity, collision) {
			entity.takeDamage(this.damage, this, collision);
		}

		network() {
			ENT.sendProperties(this, {
				active: this.active
			});
		}
	}
}