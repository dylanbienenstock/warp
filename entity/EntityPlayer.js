var boostSpeed = 1.8;
var boostDeplete = 0.5;
var boostRegen = 0.25;

module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlayer extends EntityBase {
		constructor(data) {
			super(data);

			this.networkGlobally = true;

			this.name = data.name || "Unnamed";
			this.shield = null;
			this.shieldPower = 100;
			this.health = 100;
			this.boost = 100;
			this.boosting = false;
			this.lastBoosting = false;
			this.lastBoostTime = 0;
			this.alive = true;
			this.speed = 6;
			this.lastFirePrimary = 0;
			this.lastFireSecondary = 0;

			this.viewport = {
				width: 1920,
				height: 1080,
				doNotNetwork: true
			};

			this.socketId = data.socketId;

			this.controls = {
				thrustForward: false,
				thrustBackward: false,
				thrustLeft: false,
				thrustRight: false,
				boost: false,
				firePrimary: false,
				fireSecondary: false
			};

			this.physicsObject = PHYS.new("Box", {
				restrictToMap: true,
				x: data.x || 0,
				y: data.y || 0,
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
			if (this.alive) {
				ENT.trigger(this, "hit");

				this.health = Math.max(this.health - damage, 0);

				if (this.health == 0) {
					ENT.trigger(this, "death");

					this.physicsObject.active = false;
					this.shield.physicsObject.active = false;
					this.alive = false;
					this.doNotNetwork = true;
				}

				return damage;
			}

			return 0;
		}

		controlDown(control) {

		}

		controlUp(control) {

		}

		update(timeMult) {
			super.update();

			if (this.alive) {
				if (this.physicsObject.distanceTo(0, 0) > ENT.protectedSpaceRadius + ENT.DMZRadius) {
					/*if (this.controls.firePrimary && Date.now() - this.lastFirePrimary >= 250) {
						ENT.create(ENT.new("Laser", {
							ownerId: this.id,
							x: this.physicsObject.x - Math.cos(this.physicsObject.rotation) * 24,
							y: this.physicsObject.y - Math.sin(this.physicsObject.rotation) * 24,
							rotation: this.physicsObject.rotation,
							thrustX: -Math.cos(this.physicsObject.rotation) * 32,
							thrustY: -Math.sin(this.physicsObject.rotation) * 32
						}));

						this.lastFirePrimary = Date.now();
					}*/
					if (this.controls.firePrimary && Date.now() - this.lastFirePrimary >= 250) {
						ENT.create(ENT.new("Sticky", {
							ownerId: this.id,
							x: this.physicsObject.x - Math.cos(this.physicsObject.rotation) * 24,
							y: this.physicsObject.y - Math.sin(this.physicsObject.rotation) * 24,
							radius: 7,
							thrustX: -Math.cos(this.physicsObject.rotation) * 32,
							thrustY: -Math.sin(this.physicsObject.rotation) * 32
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
								thickness: 4,
								color: 0x00FF00,
								length: 32,
								x: this.physicsObject.x - Math.cos(this.physicsObject.rotation) * 24,
								y: this.physicsObject.y - Math.sin(this.physicsObject.rotation) * 24,
								rotation: origin + offset,
								thrustX: -Math.cos(origin + offset) * 32,
								thrustY: -Math.sin(origin + offset) * 32
							}));
						}

						this.lastFireSecondary = Date.now();
					}
				}

				this.shieldPower = this.shield.power;

				if (Date.now() - this.lastBoostTime >= 1000) {
					this.boost = Math.min(this.boost + boostRegen * timeMult, 100);
				}

				this.move(timeMult);

				if (this.boosting && !this.lastBoosting) {
					ENT.trigger(this, "boost");
				}

				this.lastBoosting = this.boosting;
			} else {
				this.boosting = false;
			}
		}

		move(timeMult) {
			var degToRad = Math.PI / 180;

			this.physicsObject.thrustX = 0;
			this.physicsObject.thrustY = 0;

			this.boosting = false;

			if (this.controls.thrustForward) {
				var boostMult = 1;

				if (this.controls.boost) {
					if (this.boost > 0) {
						this.boost = Math.max(this.boost - boostDeplete * timeMult, 0);
						boostMult = boostSpeed;
						this.boosting = true;
					}

					this.lastBoostTime = Date.now();
				}

				this.physicsObject.thrustX += -Math.cos(this.physicsObject.rotation) * (this.speed * boostMult);
				this.physicsObject.thrustY += -Math.sin(this.physicsObject.rotation) * (this.speed * boostMult);
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
				controls: this.controls,
				health: this.health,
				shieldPower: this.shieldPower,
				boost: this.boost,
				boosting: this.boosting
			});
		}
	}
}