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
			// collision is defined here	
			// console.log(collision);
			if (entity instanceof ENT.type("Shield") && entity.ownerId != this.ownerId ||
				entity instanceof ENT.type("Planet") || entity instanceof ENT.type("Asteroid")) {
				console.log("sticky hit: " + entity.className);
				ENT.trigger(this, "stick", {"collision": {}, "targetId": entity.id});
				// ENT.trigger(this, "stick", {"collision": {collision}, "targetId": entity.id});
				// but when I pass it here, I get crazy strange error...
				// clearly coming from onStick client/js/entity/EntitySticky but don't get why...
			}
		}
	}
}