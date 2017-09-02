var boostSpeed = 1.8;
var boostDeplete = 0.5;
var boostRegen = 0.25;

module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlayer extends EntityBase {
		constructor(data) {
			super(data);

			this.networkGlobally = true;

			this.name = data.name || "Unnamed";
			this.credits = data.credits || 0;
			this.shield = null;
			this.shieldPower = 100;
			this.health = 100;
			this.boost = 100;
			this.boosting = false;
			this.lastBoosting = false;
			this.lastBoostTime = 0;
			this.alive = true;
			this.speed = 6;

			this.__primaryWeapon = null;
			this.__secondaryWeapon = null;
			this.primaryWeaponListing = null;
			this.secondaryWeaponListing = null;

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

		get primaryWeapon() {
			return this.__primaryWeapon;
		}

		get secondaryWeapon() {
			return this.__secondaryWeapon;
		}

		set primaryWeapon(value) {
			this.__primaryWeapon = value;
			this.primaryWeaponListing = value.constructor.getListing();
		}

		set secondaryWeapon(value) {
			this.__secondaryWeapon = value;
			this.secondaryWeaponListing = value.constructor.getListing();
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

		giveCredits(amount) {
			this.credits += Math.max(amount, 0);
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
				var now = Date.now();

				if (this.physicsObject.distanceTo(0, 0) > ENT.protectedSpaceRadius + ENT.DMZRadius) {
					var firePosition = {
						x: this.physicsObject.x - Math.cos(this.physicsObject.rotation) * 24,
						y: this.physicsObject.y - Math.sin(this.physicsObject.rotation) * 24
					};

					var fireAngle = this.physicsObject.rotation;

					if (this.primaryWeapon != undefined && this.controls.firePrimary && now - this.primaryWeapon.lastFire >= this.primaryWeapon.fireInterval) {
						this.primaryWeapon.fire(firePosition, fireAngle);
						this.primaryWeapon.lastFire = now;
					}

					if (this.secondaryWeapon != undefined && this.controls.fireSecondary && now - this.secondaryWeapon.lastFire >= this.secondaryWeapon.fireInterval) {
						this.secondaryWeapon.fire(firePosition, fireAngle);
						this.secondaryWeapon.lastFire = now;
					}
				}

				this.shieldPower = this.shield.power;

				if (now - this.lastBoostTime >= 1000) {
					this.boost = Math.min(this.boost + boostRegen * timeMult, 100);
				}

				this.move(timeMult);

				if (this.boosting && !this.lastBoosting) {
					ENT.trigger(this, "boost");
				}

				this.lastBoosting = this.boosting;
			} else {
				this.boosting = false;
				this.shield.physicsObject.active = false;
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
				credits: this.credits,
				primaryWeaponListing: this.primaryWeaponListing,
				secondaryWeaponListing: this.secondaryWeaponListing,
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