module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlanet extends EntityBase {
		constructor(data) {
			super(data);

			this.radius = data.radius || 64;

			this.physicsObject = PHYS.new("Circle", {
				x: this.x,
				y: this.y,
				radius: this.radius
			});
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		update(timeMult) {
			super.update();
		}

		network() {
			
		}
	}
}