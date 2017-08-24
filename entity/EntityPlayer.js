module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlayer extends EntityBase {
		constructor(data) {
			super("Player");

			this.shield = null;
			this.speed = 6;
			this.lastFirePrimary = 0;
			this.lastFireSecondary = 0;

			this.controls = {
				thrustForward: false,
				thrustBackward: false,
				thrustLeft: false,
				thrustRight: false,
				firePrimary: false,
				fireSecondary: false
			};

			this.physicsObject = PHYS.new("Box", {
				localX: -6,
				localY: -16,
				width: 16,
				height: 32
			});

			this.physicsObject.addChild(PHYS.new("Box", {
				localX: -22,
				localY: -5,
				width: 16,
				height: 10
			}));
		}

		create() {
			PHYS.create(this, this.physicsObject);

			this.shield = ENT.create(ENT.new("Shield", {
				ownerId: this.id
			}));
		}

		remove() {
			ENT.remove(this.shield);
		}

		takeDamage(damage, collision) {
			ENT.trigger(this, "hit");

			return damage;
		}

		update() {
			if (this.controls.firePrimary && Date.now() - this.lastFirePrimary >= 250) {
				ENT.create(ENT.new("Laser", {
					ownerId: this.id,
					x: this.physicsObject.x - Math.cos(this.physicsObject.rotation) * 16,
					y: this.physicsObject.y - Math.sin(this.physicsObject.rotation) * 16,
					rotation: this.physicsObject.rotation,
					thrustX: -Math.cos(this.physicsObject.rotation) * 30 + this.physicsObject.totalVelocityX,
					thrustY: -Math.sin(this.physicsObject.rotation) * 30 + this.physicsObject.totalVelocityY
				}));

				this.lastFirePrimary = Date.now();
			}

			if (this.controls.fireSecondary && Date.now() - this.lastFireSecondary >= 1750) {
				var angleIncrement = 8 * Math.PI / 180;
				var origin = this.physicsObject.rotation - angleIncrement * 1.5;

				for (var i = 0; i < 4; i++) {
					var offset = i * angleIncrement;

					ENT.create(ENT.new("Laser", {
						ownerId: this.id,
						thickness: 1,
						color: 0x00FF00,
						x: this.physicsObject.x - Math.cos(this.physicsObject.rotation) * 16,
						y: this.physicsObject.y - Math.sin(this.physicsObject.rotation) * 16,
						rotation: origin + offset,
						thrustX: -Math.cos(origin + offset) * 30 + this.physicsObject.totalVelocityX,
						thrustY: -Math.sin(origin + offset) * 30 + this.physicsObject.totalVelocityY
					}));
				}

				this.lastFireSecondary = Date.now();
			}

			this.move();
		}

		move() {
			var degToRad = Math.PI / 180;

			this.physicsObject.thrustX = 0;
			this.physicsObject.thrustY = 0;

			if (this.controls.thrustForward) {
				this.physicsObject.thrustX += -Math.cos(this.physicsObject.rotation) * this.speed;
				this.physicsObject.thrustY += -Math.sin(this.physicsObject.rotation) * this.speed;
			}

			if (this.controls.thrustBackward) {
				this.physicsObject.thrustX -= -Math.cos(this.physicsObject.rotation) * this.speed;
				this.physicsObject.thrustY -= -Math.sin(this.physicsObject.rotation) * this.speed;
			}

			if (this.controls.thrustLeft) {
				this.physicsObject.thrustX += -Math.cos(this.physicsObject.rotation - 90 * degToRad) * this.speed;
				this.physicsObject.thrustY += -Math.sin(this.physicsObject.rotation - 90 * degToRad) * this.speed;
			}

			if (this.controls.thrustRight) {
				this.physicsObject.thrustX += -Math.cos(this.physicsObject.rotation + 90 * degToRad) * this.speed;
				this.physicsObject.thrustY += -Math.sin(this.physicsObject.rotation + 90 * degToRad) * this.speed;
			}
		}

		network(ENT) {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y,
				rotation: this.physicsObject.rotation,
				controls: this.controls
			});
		}
	}
}