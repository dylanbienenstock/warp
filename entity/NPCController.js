module.exports = function(ENT, PHYS) {
	var NPC_MODE = {
		WANDER: 0
	};

	return class NPCController {
		constructor(ownerId) {
			this.ownerId = ownerId;
			this.__mode = NPC_MODE.WANDER;

			this.wanderAngle = null;
			this.wanderRadius = null;
			this.targetPosition = null;

			this.getWanderTarget();
		}

		get mode() {
			return this.__mode;
		}

		set mode(value) {
			changeModes(this.__mode, value);
			this.__mode = value;
		}

		distanceToTarget(owner) {
			return owner.ship.physicsObject.distanceTo(this.targetPosition.x, this.targetPosition.y);
		}

		update(timeMult) {
			var owner = ENT.getById(this.ownerId);

			if (owner != undefined &&
				owner.ship != undefined &&
				owner.ship.physicsObject != undefined) {

				this.lookTowardsTarget(owner, timeMult);

				switch (this.mode) {
					case NPC_MODE.WANDER:
						this.wander(owner);
						break;
				}
			}
		}

		changeModes(from, to) {
			var owner = ENT.getById(this.ownerId);

			if (owner != undefined &&
				owner.ship != undefined &&
				owner.ship.physicsObject != undefined) {

			}
		}

		getWanderTarget() {
			this.wanderAngle = Math.random() * 2 * Math.PI;
			this.wanderRadius = Math.random() * (PHYS.boundaryRadius - ENT.protectedSpaceRadius - ENT.DMZRadius) + ENT.protectedSpaceRadius + ENT.DMZRadius;
			this.targetPosition = {
				x: Math.cos(this.wanderAngle) * this.wanderRadius,
				y: Math.sin(this.wanderAngle) * this.wanderRadius
			};
		}

		wander(owner) {
			if (this.distanceToTarget(owner) <= 32) {
				this.getWanderTarget();
			}

			owner.controls.thrustForward = true;
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
													Math.atan2(owner.ship.physicsObject.y - this.targetPosition.y ,
															   owner.ship.physicsObject.x - this.targetPosition.x),
													0.2 * timeMult
												);
		}
	}
}