module.exports = function(owner, MEMORY, ATTRIBUTES, ENT, PHYS) {
	var now = Date.now();
	var TARGET_DISTANCE = owner.ship.physicsObject.distanceTo(MEMORY.TARGET_POSITION.x, MEMORY.TARGET_POSITION.y);

	function TARGET_IN_VIEW() {
		var toTargetX = (owner.ship.physicsObject.x - MEMORY.TARGET_POSITION.x);
		var toTargetY = (owner.ship.physicsObject.y - MEMORY.TARGET_POSITION.y);
		var toTargetLength = Math.abs(Math.sqrt(toTargetX ** 2 + toTargetY ** 2));
		toTargetX /= toTargetLength;
		toTargetY /= toTargetLength;

		var lookX = Math.cos(owner.ship.physicsObject.rotation);
		var lookY = Math.sin(owner.ship.physicsObject.rotation);
		var lookLength = Math.abs(Math.sqrt(lookX ** 2 + lookY ** 2));
		lookX /= lookLength;
		lookY /= lookLength;

		MEMORY.TARGET_DOT = (toTargetX * lookX) + (toTargetY * lookY);

		return MEMORY.TARGET_DOT >= 0.5;
	}

	function TARGET_IN_RANGE() {
		return TARGET_DISTANCE <= 1024;
	}

	function TARGET_CLOSE() {
		return TARGET_DISTANCE <= 512;
	}

	function TARGET_TOO_CLOSE() {
		return TARGET_DISTANCE <= 256
	}

	function TARGET_EVADING() {
		if (MEMORY.TARGET == null) {
			return false;
		}

		return (MEMORY.TARGET.controls.thrustForward &&
				MEMORY.TARGET.boosting);
	}

	function SHOULD_EVADE() {
		if (ATTRIBUTES.BRAVE) {
			return false;
		}

		return owner.ship.health < 40;
	}

	function SHOULD_DODGE_LEFT() {
		if (now - MEMORY.LAST_DODGE_TIME >= MEMORY.DODGE_INTERVAL) {
			MEMORY.LAST_DODGE_TIME = now;
			MEMORY.DODGE_INTERVAL = Math.random() * (ATTRIBUTES.FRANTIC ? 100 : 500) + 1000;
			MEMORY.DODGING_LEFT = !MEMORY.DODGING_LEFT;
		}

		return MEMORY.DODGING_LEFT;
	}

	function AT_DESTINATION() {
		return TARGET_DISTANCE <= 32;
	}

	function FOUND_TARGET() {
		if (!ATTRIBUTES.HOSTILE) return false;

		var players = ENT.getAllPlayers();

		for (var i = players.length - 1; i >= 0; i--) {
			var player = players[i];

			if (player.id != owner.id && !player.NPC) {
				if (owner.ship.physicsObject.distanceTo(player.ship.physicsObject.x, player.ship.physicsObject.y) <= 400) {
					MEMORY.TARGET_ID = player.id;
					return true;
				}
			}
		}

		return false;
	}

	return {
		TARGET_IN_VIEW: TARGET_IN_VIEW(),
		TARGET_IN_RANGE: TARGET_IN_RANGE(),
		TARGET_CLOSE: TARGET_CLOSE(),
		TARGET_TOO_CLOSE: TARGET_TOO_CLOSE(),
		TARGET_EVADING: TARGET_EVADING(),
		SHOULD_EVADE: SHOULD_EVADE(),
		SHOULD_DODGE_LEFT: SHOULD_DODGE_LEFT(),
		AT_DESTINATION: AT_DESTINATION(),
		FOUND_TARGET: FOUND_TARGET()
	};
}