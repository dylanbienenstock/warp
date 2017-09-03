module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPlayer extends EntityBase {
		constructor(data) {
			super(data);

			this.networkGlobally = true;

			this.name = data.name || "Unnamed";
			this.credits = data.credits || 0;
			this.shieldPower = 100;
			this.boost = 100;
			this.boosting = false;
			this.lastBoosting = false;
			this.lastBoostTime = 0;
			this.alive = true;

			this.x = data.x || 0;
			this.y = data.y || 0;

			this.__ship = null;
			this.__primaryWeapon = null;
			this.__secondaryWeapon = null;

			this.shipListing = null;
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
		}

		get ship() {
			return this.__ship;
		}

		get primaryWeapon() {
			return this.__primaryWeapon;
		}

		get secondaryWeapon() {
			return this.__secondaryWeapon;
		}

		set ship(value) {
			var shouldNetwork = this.__ship != null;

			this.__ship = value;
			this.shipListing = value.constructor.getListing();

			if (shouldNetwork) {
				ENT.trigger("changeShip", this.shipListing.className);
			}
		}

		set primaryWeapon(value) {
			this.__primaryWeapon = value;
			this.primaryWeaponListing = value.constructor.getListing();
		}

		set secondaryWeapon(value) {
			this.__secondaryWeapon = value;
			this.secondaryWeaponListing = value.constructor.getListing();
		}

		remove() {
			this.ship.remove();
		}

		giveCredits(amount) {
			this.credits += Math.max(amount, 0);
		}

		takeDamage(damage, collision) {
			if (this.alive) {
				ENT.trigger(this, "hit");

				this.ship.health = Math.max(this.ship.health - damage, 0);

				if (this.ship.health == 0) {
					ENT.trigger(this, "death");

					this.ship.physicsObject.active = false;
					this.ship.shield.physicsObject.active = false;
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

				if (this.ship.physicsObject.distanceTo(0, 0) > ENT.protectedSpaceRadius + ENT.DMZRadius) {
					var firePosition = {
						x: this.ship.physicsObject.x - Math.cos(this.ship.physicsObject.rotation) * 24,
						y: this.ship.physicsObject.y - Math.sin(this.ship.physicsObject.rotation) * 24
					};

					var fireAngle = this.ship.physicsObject.rotation;

					if (this.primaryWeapon != undefined && this.controls.firePrimary && now - this.primaryWeapon.lastFire >= this.primaryWeapon.fireInterval) {
						this.primaryWeapon.fire(firePosition, fireAngle);
						this.primaryWeapon.lastFire = now;
					}

					if (this.secondaryWeapon != undefined && this.controls.fireSecondary && now - this.secondaryWeapon.lastFire >= this.secondaryWeapon.fireInterval) {
						this.secondaryWeapon.fire(firePosition, fireAngle);
						this.secondaryWeapon.lastFire = now;
					}
				}

				this.shieldPower = this.ship.shield.power;

				if (now - this.lastBoostTime >= 1000) {
					this.boost = Math.min(this.boost + this.ship.boostRegen * timeMult, 100);
				}

				this.move(timeMult);

				if (this.boosting && !this.lastBoosting) {
					ENT.trigger(this, "boost");
				}

				this.lastBoosting = this.boosting;
			} else {
				this.boosting = false;
				this.ship.shield.physicsObject.active = false;
			}
		}

		move(timeMult) {
			var degToRad = Math.PI / 180;

			this.ship.physicsObject.thrustX = 0;
			this.ship.physicsObject.thrustY = 0;

			this.boosting = false;

			if (this.controls.thrustForward) {
				var boostMult = 1;

				if (this.controls.boost) {
					if (this.boost > 0) {
						this.boost = Math.max(this.boost - this.ship.boostDeplete * timeMult, 0);
						boostMult = this.ship.boostFactor;
						this.boosting = true;
					}

					this.lastBoostTime = Date.now();
				}

				this.ship.physicsObject.thrustX += -Math.cos(this.ship.physicsObject.rotation) * (this.ship.speed * boostMult);
				this.ship.physicsObject.thrustY += -Math.sin(this.ship.physicsObject.rotation) * (this.ship.speed * boostMult);
			}

			if (this.controls.thrustBackward) {
				this.ship.physicsObject.thrustX -= -Math.cos(this.ship.physicsObject.rotation) * this.ship.speed;
				this.ship.physicsObject.thrustY -= -Math.sin(this.ship.physicsObject.rotation) * this.ship.speed;
			}

			if (this.controls.thrustLeft) {
				this.ship.physicsObject.thrustX += -Math.cos(this.ship.physicsObject.rotation - 90 * degToRad) * this.ship.speed;
				this.ship.physicsObject.thrustY += -Math.sin(this.ship.physicsObject.rotation - 90 * degToRad) * this.ship.speed;
			}

			if (this.controls.thrustRight) {
				this.ship.physicsObject.thrustX += -Math.cos(this.ship.physicsObject.rotation + 90 * degToRad) * this.ship.speed;
				this.ship.physicsObject.thrustY += -Math.sin(this.ship.physicsObject.rotation + 90 * degToRad) * this.ship.speed;
			}
		}

		network(ENT) {
			ENT.sendProperties(this, {
				x: this.ship.physicsObject.x,
				y: this.ship.physicsObject.y,
				credits: this.credits,
				//shipListing: this.shipListing,
				primaryWeaponListing: this.primaryWeaponListing,
				secondaryWeaponListing: this.secondaryWeaponListing,
				rotation: this.ship.physicsObject.rotation,
				controls: this.controls,
				health: this.ship.health,
				shieldPower: this.shieldPower,
				boost: this.boost,
				boosting: this.boosting
			});
		}
	}
}