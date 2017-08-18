module.exports = function(EntityBase, ENT, PHYS) {

	return class EntityPlayer extends EntityBase {
		constructor(name) {
			super("Player", 0, 0, 24);

			this.name = name;
			this.angle = 0;
			this.speed = 3;
			this.controls = {
				thrustForward: false,
				thrustBackward: false,
				thrustLeft: false,
				thrustRight: false
			};

			this.physicsObject = new PHYS.PhysicsObject(-8, -8, 16, 16);
		}

		update() {
			var degToRad = Math.PI / 180;

			if (this.angle > 180 * degToRad) {
				degToRad *= -1;
			}

			if (this.controls.thrustForward) {
				this.x += -Math.cos(this.angle) * this.speed;
				this.y += -Math.sin(this.angle) * this.speed;
			}

			if (this.controls.thrustBackward) {
				this.x -= -Math.cos(this.angle) * this.speed;
				this.y -= -Math.sin(this.angle) * this.speed;
			}

			if (this.controls.thrustLeft) {
				this.x += -Math.cos(this.angle - 90 * degToRad) * this.speed;
				this.y += -Math.sin(this.angle - 90 * degToRad) * this.speed;
			}

			if (this.controls.thrustRight) {
				this.x += -Math.cos(this.angle + 90 * degToRad) * this.speed;
				this.y += -Math.sin(this.angle + 90 * degToRad) * this.speed;
			}
		}

		network(ENT) {
			ENT.sendProperties(this, {
				x: this.x,
				y: this.y,
				angle: this.angle,
				controls: this.controls
			});
		}
	}
}