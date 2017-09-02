module.exports = function(EntityBase, ENT, PHYS) {
	return class EntitySticky extends EntityBase {
		constructor(data) {
			super(data);

			this.lifespan = data.lifespan || 10000;

			this.ownerId = data.ownerId;
			this.damage = data.damage || 10;
			this.radius = data.radius || 4;
			this.stuck = false;

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
			if (entity instanceof ENT.type("Shield") && entity.ownerId != this.ownerId ||
				entity instanceof ENT.type("Planet") || entity instanceof ENT.type("Asteroid") &&
				!this.stuck) {
				debugger;
				console.log("sticky hit: " + entity.className);
				ENT.trigger(this, "stick",
					{"collision":
						{
							"x": collision.position.x,
							"y": collision.position.y
						}, "targetId": entity.id}
				);
				PHYS.remove(this.physicsObject);
				this.stuck = true;
			}
		}
	}
}