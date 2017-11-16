module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityLaser extends EntityBase {
		constructor(data) {
			super(data);

			this.lifespan = data.lifespan || 1000;

			this.angle = data.angle || 0;
			this.speed = data.speed || 0;
 
			this.ownerId = data.ownerId;
			this.damage = data.damage || 10;
			this.thickness = data.thickness || 2;
			this.color = data.color || 0xFF0000;
			this.length = data.length || 64;
			this.x = data.x;
			this.y = data.y;
			this.rotation = data.angle;
			this.createParticles = data.createParticles;

			if (this.createParticles == undefined) {
				this.createParticles = true;
			}

			this.physicsObject = PHYS.new("Box", {
				collisionGroup: "Projectile",
				x: this.x,
				y: this.y,
				localX: -this.length,
				localY: -9,
				width: this.length,
				height: 18,
				rotation: this.angle,
				thrustX: -Math.cos(this.angle) * this.speed,
				thrustY: -Math.sin(this.angle) * this.speed
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
			entity.takeDamage(this.damage, this, collision);
		}

		giveDamage(amount, entity) {
			ENT.remove(this);
		}
	}
}