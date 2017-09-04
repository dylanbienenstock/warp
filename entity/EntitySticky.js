module.exports = function(EntityBase, ENT, PHYS) {
	return class EntitySticky extends EntityBase {
		constructor(data) {
			super(data);

			this.x = data.x;
			this.y = data.y;
			this.ownerId = data.ownerId;
			this.damage = data.damage || 10;
			this.radius = data.radius || 4;
			this.explodeTime = data.explodeTime || 10000;

			this.stuck = false;
			this.target = undefined;
			this.networkGlobally = true;
			this.launchTime = Date.now();

			this.physicsObject = PHYS.new("Circle", {
				collisionGroup: "Projectile",
				x: data.x,
				y: data.y,
				radius: data.radius,
				thrustX: -Math.cos(data.angle) * data.speed,
				thrustY: -Math.sin(data.angle) * data.speed
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

		update() {
			super.update();
			if (this.launchTime + this.explodeTime < Date.now()) {
				this.explode();
			}
		}
		
		collideWith(entity, collision) {
			// this.stuck check probably unnecessary if physicsObject inactive
			if (!this.stuck) {	
				if (entity instanceof ENT.type("Player") &&
					entity.id != this.ownerId ||
					entity instanceof ENT.type("Planet") || 
					entity instanceof ENT.type("Asteroid")) {

					this.target = entity;
					this.collision = collision;
					// store these for later, need to calculate explosion pos

					this.physicsObject.active = false;
					// PHYS.remove(this.physicsObject);

					ENT.trigger(this, "stick",
						{
							"collision": {
								"x": collision.position.x,
								"y": collision.position.y
							}, 
							"targetId": entity.id
						}
					);
					
					this.stuck = true;
				}
			}
		}

		explode() {
			// calculate difference between collision position
			// and target position to find where to create explosion
			console.log("sticky exploded");
			ENT.trigger(this, "explode", {});
			ENT.remove(this);

		}
	}
}