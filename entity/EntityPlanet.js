// Background, Land, Clouds
var colorSchemes = [
	[ 0x3280B4, 0x82C864, 0xFFFFFF ], // 0: Earth
	[ 0x0f5064, 0x00be82, 0xFFFFFF ], // 1: Earth 2
	[ 0x00a4d6, 0xFFFFFF, 0x888888 ], // 2: Arctic
	[ 0x7a4561, 0xDC78BE, null ], 	  // 3: Pink
	[ 0xb42d1e, 0xdc4632, null ],	  // 4: Mars
	[ 0x787878, 0x3c3c3c, null ],	  // 5: Gray
	[ 0xbedcc8, 0x41a571, null ],	  // 5: Ghostly
];

// colorSchemes can be "any" or an array of indices
var skinInfo = [
	{
		id: 0,
		colorSchemes: "any",
		hasClouds: true
	},

	{
		id: 1,
		colorSchemes: "any",
		hasClouds: true
	}
];

module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlanet extends EntityBase {
		constructor(data) {
			super(data);

			this.networkGlobally = true;
			this.canTakeDamage = true;
			this.skinInfo = skinInfo[Math.floor(Math.random() * skinInfo.length)];

			if (this.skinInfo.colorSchemes == "any") {
				this.colors = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
			} else {
				this.colors = colorSchemes[this.skinInfo.colorSchemes[Math.floor(Math.random() * this.skinInfo.colorSchemes.length)]];
			}

			this.radius = data.radius || 64;
			this.orbitEntityId = data.orbitEntityId;
			this.orbitRadius = data.orbitRadius;
			this.orbitOffset = data.orbitOffset;
			this.orbitSpeedDivisor = data.orbitSpeedDivisor;

			this.physicsObject = PHYS.new("Circle", {
				restrictToMap: true,
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

			// Orbit
			if (this.orbitEntityId != undefined) {
				ENT.getById(this.orbitEntityId, function(orbitEntity) {
					if (orbitEntity.physicsObject != undefined) {
						var now = Date.now();

						var orbitX = Math.cos(now / this.orbitSpeedDivisor + this.orbitOffset) * this.orbitRadius;
						var orbitY = Math.sin(now / this.orbitSpeedDivisor + this.orbitOffset) * this.orbitRadius;

						this.physicsObject.x = orbitEntity.physicsObject.x + orbitX - this.radius;
						this.physicsObject.y = orbitEntity.physicsObject.y + orbitY - this.radius;
					}
				}.bind(this));
			}
		}

		network() {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y
			});
		}
	}
}