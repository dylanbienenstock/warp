var gravityRadius = 2048;
var gravityFalloff = 256;

module.exports = function(EntityBase, ENT, PHYS) {
	return class EntitySun extends EntityBase {
		constructor(data) {
			super(data);

			this.radius = data.radius || 512;
			this.color = data.color || 0xFF6622;
			this.gravityConstant = data.gravityConstant || 750000;
			this.isBlackHole = data.isBlackHole;
		}

		update(timeMult) {
			super.update();

			// Gravity
			for (var i = ENT.getAllPlayers().length - 1; i >= 0; i--) {
				var player = ENT.getAllPlayers()[i];
				var dist = player.ship.physicsObject.distanceTo(this.x, this.y);

				if (dist > this.radius && dist <= gravityRadius) {
					var force = this.gravityConstant / Math.pow(dist, 2);
					var angle = Math.atan2(player.ship.physicsObject.y - this.y, player.ship.physicsObject.x - this.x);
					var falloffDist = dist - (gravityRadius - gravityFalloff);
					
					if (falloffDist < gravityFalloff && falloffDist > 0) {
						force *= 1 - falloffDist / gravityFalloff;
					}

					player.ship.physicsObject.velocityX += -Math.cos(angle) * force;
					player.ship.physicsObject.velocityY += -Math.sin(angle) * force;
				}
			}
		}
	}
}