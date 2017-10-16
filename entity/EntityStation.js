module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityStation extends EntityBase {
		constructor(data) {
			super(data);

			this.networkGlobally = true;

			this.radius = data.radius || 256;
			this.alignment = data.alignment || "neutral";
			this.orbitEntityId = data.orbitEntityId;
			this.orbitRadius = data.orbitRadius;
			this.orbitOffset = data.orbitOffset;
			this.orbitSpeedDivisor = data.orbitSpeedDivisor;
		}

		update() {
			super.update();

			this.orbit();
		}

		orbit() {
			if (this.orbitEntityId != undefined) {
				ENT.getById(this.orbitEntityId, function(orbitEntity) {
					if (orbitEntity.physicsObject != undefined) {
						var now = Date.now();

						var orbitX = Math.cos(now / this.orbitSpeedDivisor + this.orbitOffset) * (this.orbitRadius);
						var orbitY = Math.sin(now / this.orbitSpeedDivisor + this.orbitOffset) * (this.orbitRadius);

						this.x = orbitEntity.physicsObject.x + orbitX;
						this.y = orbitEntity.physicsObject.y + orbitY;
					}
				}.bind(this));
			}	
		}

		network() {
			ENT.sendProperties(this, {
				x: this.x,
				y: this.y
			});
		}
	}
}