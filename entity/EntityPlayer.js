module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlayer extends EntityBase {
		constructor(name) {
			super("Player", 0, 0);

			this.name = name;
			this.rotation = 0;
			this.speed = 3;
			this.controls = {
				thrustForward: false,
				thrustBackward: false,
				thrustLeft: false,
				thrustRight: false
			};

			this.physicsObject = new PHYS.PhysicsObject({
				localX: -6,
				localY: -16,
				width: 16,
				height: 32,
				velocityX: 5
			});

			this.physicsObject.addChild(new PHYS.PhysicsObject(
			{
				localX: -22,
				localY: -5,
				width: 16,
				height: 10
			}));

			PHYS.create(this.physicsObject);
		}

		create() {

		}

		update() {
			var degToRad = Math.PI / 180;

			if (this.rotation > 180 * degToRad) {
				degToRad *= -1;
			}

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