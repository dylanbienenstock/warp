module.exports = function(EntityBase, ENT, PHYS) {
	return class EntitySticky extends EntityBase {
		constructor(data) {
			super(data);

			//this.lifespan = data.lifespan || 10000;

			this.ownerId = data.ownerId;
			this.damage = data.damage || 10;
			this.radius = data.radius || 4;
			this.stuck = false;
			this.target = undefined;
			this.networkGlobally = true;
			this.EXPLODE_TIME = 10000;

			this.x = data.x;
			this.y = data.y;

			this.launchTime = Date.now();

			this.physicsObject = PHYS.new("Circle", {
				collisionGroup: "Projectile",
				x: data.x,
				y: data.y,
				radius: data.radius,
				localX: 0,
				localY: 0,
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
			if (this. stuck && this.target) {
				// update this.x and this.y accordingly
			}
			if (this.launchTime + this.EXPLODE_TIME < Date.now()) {
				this.explode();
				ENT.remove(this);
			}
		}
		
		collideWith(entity, collision) {	
			if (entity instanceof ENT.type("Player") && entity.id != this.ownerId ||
				entity instanceof ENT.type("Planet") || entity instanceof ENT.type("Asteroid") &&
				!this.stuck) {
				console.log("sticky hit: " + entity.className);
				console.log(entity.id);
				console.log(this.ownerId);

				this.target = entity;
				//HYS.remove(this.physicsObject);
				this.physicsObject.active = false;

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

		explode() {
			console.log("sticky exploded");

		}
	}
}