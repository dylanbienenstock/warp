var attractionRange = 200;
var attractionStrength = 1.5;

module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityBouncerOrb extends EntityBase {
		constructor(data) {
			super(data);

			this.lifespan = data.lifespan || 2000;
			this.networkGlobally = true;

			this.angle = data.angle || 0;
			this.speed = data.speed || 0;
 
			this.ownerId = data.ownerId;
			this.color = data.color || 0xFF0000;
			this.x = data.x;
			this.y = data.y;
			this.radius = data.radius || 36;
			this.attachedPlayerIds = [];

			this.physicsObject = PHYS.new("Box", {
				collisionGroup: "Projectile",
				x: this.x,
				y: this.y,
				width: this.radius * 2,
				height: this.radius * 2,
				localX: -this.radius,
				localY: -this.radius,
				rotation: this.angle,
				thrustX: -Math.cos(this.angle) * this.speed,
				thrustY: -Math.sin(this.angle) * this.speed
			});

			this.physicsObject.addChild(PHYS.new("Box", {
				width: this.radius,
				height: this.radius,
				localX: this.radius / 2,
				localY: -this.radius / 2
			}));

			this.physicsObject.addChild(PHYS.new("Box", {
				width: this.radius,
				height: this.radius,
				localX: -this.radius * 1.5,
				localY: -this.radius / 2
			}));

			this.physicsObject.addChild(PHYS.new("Circle", {
				radius: this.radius / 4 * 3
			}));
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

		// From util.js
		lerp(v0, v1, t) {
			return (1 - t) * v0 + t * v1;
		}

		update() {
			ENT.getAllPlayers().forEach(function(player) {
				if (player != undefined) {
					if (this.attachedPlayerIds.includes(player.id)) {
						player.physicsObject.x = this.lerp(player.physicsObject.x, this.physicsObject.x, 0.6);
						player.physicsObject.y = this.lerp(player.physicsObject.y, this.physicsObject.y, 0.6);
						player.controls.thrustForward = false;
						player.controls.thrustBackward = false;
						player.controls.thrustLeft = false;
						player.controls.thrustRight = false;
					}
					else if (player.id != this.ownerId && player.physicsObject.distanceTo(this.physicsObject.x, this.physicsObject.y) <= attractionRange) {
						var angle = Math.atan2(player.physicsObject.y - this.physicsObject.y, player.physicsObject.x - this.physicsObject.x);

						player.physicsObject.velocityX += -Math.cos(angle) * attractionStrength;
						player.physicsObject.velocityY += -Math.sin(angle) * attractionStrength;
					}
				}
			}.bind(this));
		}

		collideWith(entity, collision) {
			if (entity instanceof ENT.type("Shield") && entity.ownerId != this.ownerId) {
				if (!this.attachedPlayerIds.includes(entity.ownerId)) {
					if (ENT.getById(entity.ownerId) != undefined) {
						this.attachedPlayerIds.push(entity.ownerId);
					}
				}
			}

			if (entity instanceof ENT.type("Player") && entity.id != this.ownerId) {
				if (!this.attachedPlayerIds.includes(entity.id)) {
					this.attachedPlayerIds.push(entity.id);
				}
			}
		}
	}
}