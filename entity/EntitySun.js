var gravityRadius = 1028;
var gravityFalloff = 256;
var systemRadius = 4096 - 128;

module.exports = function(EntityBase, ENT, PHYS) {
	return class EntitySun extends EntityBase {
		constructor(data) {
			super(data);

			this.networkGlobally = true;

			this.radius = data.radius || 512;
			this.gravityRadius = this.radius + gravityRadius - 256;
			this.systemRadius = systemRadius;
			this.color = data.color || 0xFF6622;
			this.gravityConstant = data.gravityConstant || 600000;
			this.isBlackHole = data.isBlackHole;

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

			// Gravity
			for (var i = ENT.getAllPlayers().length - 1; i >= 0; i--) {
				var player = ENT.getAllPlayers()[i];
				var dist = player.ship.physicsObject.distanceTo(this.physicsObject.x, this.physicsObject.y);

				if (dist > this.radius && dist <= this.gravityRadius) {
					var force = this.gravityConstant / Math.pow(dist, 2);
					var angle = Math.atan2(player.ship.physicsObject.y - this.physicsObject.y, player.ship.physicsObject.x - this.physicsObject.x);
					var falloffDist = dist - (this.gravityRadius - gravityFalloff);
					
					if (falloffDist < gravityFalloff && falloffDist > 0) {
						force *= 1 - falloffDist / gravityFalloff;
					}

					player.ship.physicsObject.velocityX -= Math.cos(angle) * force;
					player.ship.physicsObject.velocityY -= Math.sin(angle) * force;
				}
				else if (dist < this.radius) {
					player.kill();
				}
			}

			// Orbit
			if (this.orbitEntityId != undefined) {
				ENT.getById(this.orbitEntityId, function(orbitEntity) {
					if (orbitEntity.physicsObject != undefined) {
						var now = Date.now();

						var orbitX = Math.cos(now / this.orbitSpeedDivisor + this.orbitOffset) * (this.orbitRadius - this.radius);
						var orbitY = Math.sin(now / this.orbitSpeedDivisor + this.orbitOffset) * (this.orbitRadius - this.radius);

						this.physicsObject.x = orbitEntity.physicsObject.x + orbitX;
						this.physicsObject.y = orbitEntity.physicsObject.y + orbitY;
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

		createUniverse() {
			for (var i = 0; i < 8; i++) {
				var sun = ENT.create(ENT.new("Sun", {
					x: 0,
					y: 0,
					orbitEntityId: this.id,
					orbitRadius: Math.pow(2, 14) - this.systemRadius - 1024,
					orbitOffset: Math.PI * 2 / 8 * i,
					orbitSpeedDivisor: 24 * 60000
				}));

				sun.createSolarSystem();
			}
		}

		createSolarSystem() {
			var initialCreationRadius = this.gravityRadius + 512
			var creationRadius = initialCreationRadius;
			var nextObjectRadius = Math.round(Math.random() * 64 + 32);

			while (creationRadius + nextObjectRadius < this.systemRadius - 512) {
				creationRadius += nextObjectRadius * 4 + Math.random() * 64 + 16;

				ENT.create(ENT.new("Planet", {
					x: 0,
					y: 0,
					radius: nextObjectRadius,
					orbitEntityId: this.id,
					orbitRadius: creationRadius,
					orbitOffset: Math.PI * 2 * Math.random(),
					orbitSpeedDivisor: 8 * 60000 + 
									   ((creationRadius - initialCreationRadius) /
									   	(this.systemRadius - initialCreationRadius) * 4 * 60000)
				}));

				nextObjectRadius = Math.round(Math.random() * 64 + 32);
			}
		}
	}
}