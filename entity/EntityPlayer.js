module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlayer extends EntityBase {
		constructor(data) {
			super("Player");

			this.shield = null;
			this.speed = 6;
			this.lastFirePrimary = 0;

			this.controls = {
				thrustForward: false,
				thrustBackward: false,
				thrustLeft: false,
				thrustRight: false,
				firePrimary: false,
				fireSecondary: false
			};

			this.physicsObject = new PHYS.PhysicsObject({
				localX: -6,
				localY: -16,
				width: 16,
				height: 32
			});

			this.physicsObject.addChild(new PHYS.PhysicsObject({
				localX: -22,
				localY: -5,
				width: 16,
				height: 10
			}));
		}

		create() {
			if (this.physicsObject != undefined && this.physicsObject != null) {
				PHYS.create(this, this.physicsObject);
			}

			this.shield = ENT.create(ENT.new({
				className: "Shield",
				ownerId: this.id
			}));
		}

		remove() {
			ENT.remove(this.shield);
		}

		takeDamage(damage, collision) {
			var damage = this.shield.takeDamage(damage, collision);

			if (damage > 0) {
				ENT.trigger(this, "hit");
			}

			return damage;
		}

		update() {
			if (this.controls.firePrimary && Date.now() - this.lastFirePrimary >= 250) {
				var laser = ENT.create(ENT.new({
					className: "Laser",
					ownerId: this.id,
					x: this.physicsObject.x - Math.cos(this.physicsObject.rotation) * 16,
					y: this.physicsObject.y - Math.sin(this.physicsObject.rotation) * 16,
					rotation: this.physicsObject.rotation,
					thrustX: -Math.cos(this.physicsObject.rotation) * 30 + this.physicsObject.totalVelocityX,
					thrustY: -Math.sin(this.physicsObject.rotation) * 30 + this.physicsObject.totalVelocityY
				}));

				this.lastFirePrimary = Date.now();
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