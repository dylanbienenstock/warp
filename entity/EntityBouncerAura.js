var bounceForceConstant = 6000;
var maxBounceForce = 5;

module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityBouncerAura extends EntityBase {
		constructor(data) {
			super(data);

			this.ownerId = data.ownerId;
			this.color = data.color || 0xFF00FF;
			this.radius = data.radius || 200;
			this.x = data.x;
			this.y = data.y;
			this.rotation = data.angle;
			this.destAlpha = 0;
		}

		update() {
			var owner = ENT.getById(this.ownerId);
			this.destAlpha = 0;

			if (owner != undefined) {
				this.x = owner.physicsObject.x;
				this.y = owner.physicsObject.y;
			}

			if (owner.physicsObject.distanceTo(0, 0) >= ENT.protectedSpaceRadius + ENT.DMZRadius) {
				ENT.getAllPlayers().forEach(function(player) {
					if (player.physicsObject.distanceTo(0, 0) >= ENT.protectedSpaceRadius + ENT.DMZRadius) {
						var distance = player.physicsObject.distanceTo(this.x, this.y);

						if (player.id != this.ownerId && distance <= this.radius) {
							var angle = Math.atan2(this.y - player.physicsObject.y, this.x - player.physicsObject.x);
							var distanceSqr = Math.pow(distance, 2);

							player.physicsObject.velocityX += -Math.cos(angle) * Math.min(bounceForceConstant / distanceSqr, maxBounceForce);
							player.physicsObject.velocityY += -Math.sin(angle) * Math.min(bounceForceConstant / distanceSqr, maxBounceForce);

							this.destAlpha = Math.max(this.destAlpha, Math.min((this.radius - distance) / this.radius, 1));
						}
					}
				}.bind(this));
			}
		}

		network() {
			ENT.sendProperties(this, {
				x: this.x,
				y: this.y,
				destAlpha: this.destAlpha
			});
		}
	}
}