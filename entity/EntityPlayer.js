module.exports = function(EntityBase, ENT, PHYS) {
	var NPCController = require("../entity/NPCController.js")(ENT, PHYS);

	return class EntityPlayer extends EntityBase {
		constructor(data) {
			super(data);

			this.networkGlobally = true;

			this.name = data.name || "Unnamed";
			this.chatHue = Math.floor(Math.random() * 359);

			this.credits = data.credits || 0;
			this.shieldPower = 100;
			this.boost = 100;
			this.boosting = false;
			this.lastBoosting = false;
			this.lastBoostTime = 0;
			this.alive = true;

			this.NPC = data.NPC;
			this.NPCController = null;
			this.NPCProfile = data.NPCProfile;

			if (this.NPCProfile != undefined) {
				this.NPCProfile.doNotNetwork = true;
			}

			this.lockedPlayerId = null;
			this.lockOnPosition = null;

			this.x = data.x || 0;
			this.y = data.y || 0;

			this.__ship = null;
			this.__primaryWeapon = null;
			this.__secondaryWeapon = null;
			this.__specialWeapon = null;

			this.shipListing = null;
			this.primaryWeaponListing = null;
			this.secondaryWeaponListing = null;
			this.specialWeaponListing = null;

			this.shouldNetworkShipListing = true;
			this.shouldNetworkPrimaryWeaponListing = true;
			this.shouldNetworkSecondaryWeaponListing = true;
			this.shouldNetworkSpecialWeaponListing = true;

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
				fireSecondary: false,
				fireSpecial: false
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

		get specialWeapon() {
			return this.__specialWeapon;
		}

		set ship(value) {
			var shouldNetwork = this.__ship != null;

			this.__ship = value;
			this.shipListing = value.constructor.getListing();

			if (shouldNetwork) {
				ENT.trigger(this, "changeShip", this.shipListing.className);
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

		set specialWeapon(value) {
			this.__specialWeapon = value;
			this.specialWeaponListing = value.constructor.getListing();
		}

		create() {
			if (this.NPC) {
				this.NPCController = new NPCController(this.id);
				this.NPCController.generateAttributes(this.NPCProfile);
			}
		}

		remove() {
			this.ship.remove();
		}

		giveCredits(amount) {
			this.credits += Math.max(amount, 0);
		}

		offend(attackerId) {
			if (this.NPC && this.NPCController != undefined) {
				this.NPCController.onAttacked(attackerId);
			}
		}

		takeDamage(damage, collision) {
			if (this.alive) {
				ENT.trigger(this, "hit");

				this.ship.health = Math.max(this.ship.health - damage, 0);

				if (this.ship.health == 0) {
					ENT.trigger(this, "death");
					console.log("! Player " + this.name + " was destroyed!");

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
			if (control == "firePrimary") {
				this.primaryWeapon.beginFire(this.getFirePosition(), this.getFireAngle());
			} else if (control == "fireSecondary" && this.secondaryWeapon != undefined) {
				this.secondaryWeapon.beginFire(this.getFirePosition(), this.getFireAngle());
			} else if (control == "fireSpecial" && this.specialWeapon != undefined) {
				this.specialWeapon.beginFire(this.getFirePosition(), this.getFireAngle());
			}
		}

		controlUp(control) {
			if (control == "firePrimary") {
				this.primaryWeapon.endFire(this.getFirePosition(), this.getFireAngle());
			} else if (control == "fireSecondary" && this.secondaryWeapon != undefined) {
				this.secondaryWeapon.endFire(this.getFirePosition(), this.getFireAngle());
			} else if (control == "fireSpecial" && this.specialWeapon != undefined) {
				this.specialWeapon.endFire(this.getFirePosition(), this.getFireAngle());
			}
		}

		getFirePosition() {
			return {
				x: this.ship.physicsObject.x - Math.cos(this.ship.physicsObject.rotation) * 24,
				y: this.ship.physicsObject.y - Math.sin(this.ship.physicsObject.rotation) * 24
			};
		}

		getFireAngle() {
			return this.ship.physicsObject.rotation;
		}

		update(timeMult) {
			super.update();

			if (this.NPC && this.NPCController != null) {
				this.NPCController.update(timeMult);
			}

			if (this.alive) {
				var now = Date.now();

				var firePosition = this.getFirePosition();
				var fireAngle = this.getFireAngle();

				this.primaryWeapon.update(firePosition, fireAngle, timeMult);

				if (this.secondaryWeapon != undefined) {
					this.secondaryWeapon.update(firePosition, fireAngle, timeMult);
				}

				if (this.specialWeapon != undefined) {
					this.specialWeapon.update(firePosition, fireAngle, timeMult);
				}

				if (this.lockedPlayerId != null) {
					var lockedPlayer = ENT.getById(this.lockedPlayerId);

					if (lockedPlayer != undefined) {
						this.lockOnPosition = {
							x: lockedPlayer.physicsObject.x,
							y: lockedPlayer.physicsObject.y
						};

						if (this.physicsObject.distanceTo(this.lockOnPosition.x, this.lockOnPosition.y) > 2048 ||
							!lockedPlayer.alive) {
							
							this.lockedPlayerId = null;
							this.lockOnPosition = null;
							ENT.trigger(this, "lockBroken");
						}
					}
				}

				if (this.ship.physicsObject.distanceTo(0, 0) > ENT.protectedSpaceRadius + ENT.DMZRadius) {
					if (this.primaryWeapon != undefined && this.controls.firePrimary && now - this.primaryWeapon.lastFire >= this.primaryWeapon.fireInterval) {
						this.primaryWeapon.fire(firePosition, fireAngle);
						this.primaryWeapon.lastFire = now;
					}

					if (this.secondaryWeapon != undefined && this.controls.fireSecondary && now - this.secondaryWeapon.lastFire >= this.secondaryWeapon.fireInterval) {
						this.secondaryWeapon.fire(firePosition, fireAngle);
						this.secondaryWeapon.lastFire = now;
					}

					if (this.specialWeapon != undefined && this.controls.fireSpecial && now - this.specialWeapon.lastFire >= this.specialWeapon.fireInterval) {
						this.specialWeapon.fire(firePosition, fireAngle);
						this.specialWeapon.lastFire = now;
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
			var toSend = {
				x: this.ship.physicsObject.x,
				y: this.ship.physicsObject.y,
				credits: this.credits,
				rotation: this.ship.physicsObject.rotation,
				controls: this.controls,
				health: this.ship.health,
				shieldPower: this.shieldPower,
				boost: this.boost,
				boosting: this.boosting
			};

			if (this.shouldNetworkShipListing) {
				toSend.shipListing = this.shipListing;
				this.shouldNetworkShipListing = false;
			}

			if (this.shouldNetworkPrimaryWeaponListing) {
				toSend.primaryWeaponListing = this.primaryWeaponListing;
				this.shouldNetworkPrimaryWeaponListing = false;
			}

			if (this.shouldNetworkSecondaryWeaponListing) {
				toSend.secondaryWeaponListing = this.secondaryWeaponListing;
				this.shouldNetworkSecondaryWeaponListing = false;
			}

			if (this.shouldNetworkSpecialWeaponListing) {
				toSend.specialWeaponListing = this.specialWeaponListing;
				this.shouldNetworkSpecialWeaponListing = false;
			}

			ENT.sendProperties(this, toSend);
		}

		remove() {
			this.ship.remove();
			this.primaryWeapon.remove();

			if (this.secondaryWeapon != undefined) {
				this.secondaryWeapon.remove();
			}

			if (this.specialWeapon != undefined) {
				this.specialWeapon.remove();
			}
		}
	}
}