var angleLerpFactor = 0.8;
var reactionTime = 400;

module.exports = function(ENT, PHYS) {
	var NPCInput = require("../entity/NPCInput.js");

	var NPC_MODE = {
		WANDER: 0,  // Travels between random locations
		ATTACK: 1,  // Attacks target
		EVADE:  2,  // Runs from target
	};

	return class NPCController {
		constructor(ownerId) {
			this.ownerId = ownerId;
			this.__mode = NPC_MODE.WANDER;
			this.lastControlChangeTimes = null;

			this.MEMORY = {
				TARGET_POSITION: { x: 0, y: 0 },
				TARGET_ID: -1,
				DODGING_LEFT: false,
				LAST_DODGE_TIME: 0,
				DODGE_INTERVAL: 0,
				WAITING_FOR_BOOST: false
			}

			this.ATTRIBUTES = {
				FRANTIC: null,  // Moves erratically
				BRAVE: null,    // Doesn't run when health is low
				HOSTILE: null,  // Aggro towards enemies
				SNIPER: null,   // Leads shots
				EXPLORER: null, // Prefers to stay far from center of map
			};
		}

		get mode() {
			return this.__mode;
		}

		set mode(value) {
			this.onChangeModes(this.__mode, value);
			this.__mode = value;
		}

		generateAttributes(profile) {
			for (var attribute in profile) {
				if (profile.hasOwnProperty(attribute)) {
					this.ATTRIBUTES[attribute] = Math.random() <= profile[attribute];
				}
			}
		}

		update(timeMult) {
			var owner = ENT.getById(this.ownerId);
			var now = Date.now();

			if (this.lastControlChangeTimes == undefined) {
				this.lastControlChangeTimes = {};

				for (var control in owner.controls) {
					if (owner.controls.hasOwnProperty(control)) {
						this.lastControlChangeTimes[control] = 0;
					}
				}
			}

			if (owner != undefined &&
				owner.ship != undefined &&
				owner.ship.physicsObject != undefined) {

				this.lookTowardsTarget(owner, timeMult);

				var INPUT = NPCInput(owner, this.MEMORY, this.ATTRIBUTES, ENT, PHYS);
				var controls = {};

				if (INPUT.SHOULD_EVADE) {
					this.mode = NPC_MODE.EVADE;
				}

				this.MEMORY.TARGET = ENT.getById(this.MEMORY.TARGET_ID);

				switch (this.mode) {
					case NPC_MODE.WANDER:
						this.WANDER(owner, controls, INPUT);
						break;
					case NPC_MODE.ATTACK:
						this.ATTACK(owner, controls, INPUT);
						break;
					case NPC_MODE.EVADE:
						this.EVADE(owner, controls, INPUT);
						break;
				}

				if (owner.boost < 10) {
					this.MEMORY.WAITING_FOR_BOOST = true;
				}

				if (this.MEMORY.WAITING_FOR_BOOST) {
					owner.controls.boost = false;
					controls.boost = false;

					if (owner.boost > 90) {
						this.MEMORY.WAITING_FOR_BOOST = false;
					}
				}

				for (var control in controls) {
					if (controls.hasOwnProperty(control) && now - this.lastControlChangeTimes[control] >= reactionTime) {
						this.lastControlChangeTimes[control] = now;
						owner.controls[control] = controls[control];
					}
				}
			}
		}

		onChangeModes(from, to) {
			var owner = ENT.getById(this.ownerId);

			if (owner != undefined &&
				owner.ship != undefined &&
				owner.ship.physicsObject != undefined) {

			}
		}

		onAttacked(attackerId) {
			this.MEMORY.TARGET_ID = attackerId;
			this.mode = NPC_MODE.ATTACK;
		}

		WANDER(owner, controls, INPUT) {
			if (INPUT.AT_DESTINATION) {
				var wanderAngle = Math.random() * 2 * Math.PI;
				var wanderRadius = Math.random() * (PHYS.boundaryRadius - ENT.protectedSpaceRadius - ENT.DMZRadius) +
													ENT.protectedSpaceRadius +
													ENT.DMZRadius;

				this.MEMORY.TARGET_POSITION = {
					x: Math.cos(wanderAngle) * wanderRadius,
					y: Math.sin(wanderAngle) * wanderRadius
				};
			}

			controls.thrustForward = true;
		}

		ATTACK(owner, controls, INPUT) {
			this.MEMORY.TARGET = ENT.getById(this.MEMORY.TARGET_ID);

			if (this.MEMORY.TARGET != undefined) {
				this.MEMORY.TARGET_POSITION = { x: this.MEMORY.TARGET.ship.physicsObject.x, y: this.MEMORY.TARGET.ship.physicsObject.y };

				controls.thrustForward = true;
				controls.thrustBackward = false;

				if (INPUT.TARGET_IN_RANGE) {
					controls.firePrimary = true;
					controls.fireSecondary = true;
				}

				if (INPUT.TARGET_CLOSE) {
					if (INPUT.SHOULD_DODGE_LEFT) {
						controls.thrustLeft = !INPUT.TARGET_EVADING;
						controls.thrustRight = false;
					} else {
						controls.thrustLeft = false;
						controls.thrustRight = !INPUT.TARGET_EVADING;
					}
				}

				if (INPUT.TARGET_TOO_CLOSE) {
					controls.thrustForward = false;
					controls.thrustBackward = true;
				}
			}
		}

		EVADE(owner, controls, INPUT) {
			var evadeAngle = Math.atan2(this.MEMORY.TARGET.ship.physicsObject.y - owner.ship.physicsObject.y,
										this.MEMORY.TARGET.ship.physicsObject.x - owner.ship.physicsObject.x)
			this.MEMORY.TARGET_POSITION = {
											x: owner.ship.physicsObject.x - Math.cos(evadeAngle) * 32,
											y: owner.ship.physicsObject.y - Math.sin(evadeAngle) * 32 
										};

			controls.boost = true;
			controls.thrustForward = true;
			controls.thrustBackward = false;
			controls.thrustLeft = false;
			controls.thrustRight = false;
			controls.firePrimary = false;
			controls.fireSecondary = false;
		}

		// From utils.js
		shortAngleDist(a0, a1) {
		    var max = Math.PI*2;
		    var da = (a1 - a0) % max;
		    return 2 * da % max - da;
		}

		// From utils.js
		lerpAngle(a0, a1, t) {
		    return a0 + this.shortAngleDist(a0, a1) * t;
		}

		lookTowardsTarget(owner, timeMult) {
			owner.ship.physicsObject.rotation = this.lerpAngle(
													owner.ship.physicsObject.rotation,
													Math.atan2(owner.ship.physicsObject.y - this.MEMORY.TARGET_POSITION.y,
															   owner.ship.physicsObject.x - this.MEMORY.TARGET_POSITION.x),
													angleLerpFactor * timeMult
												);
		}
	}
}