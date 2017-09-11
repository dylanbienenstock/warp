module.exports = function(owner, MEMORY, ATTRIBUTES, ENT, PHYS) {
	var now = Date.now();
	var TARGET_DISTANCE = owner.ship.physicsObject.distanceTo(MEMORY.TARGET_POSITION.x, MEMORY.TARGET_POSITION.y);

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

		return (MEMORY.TARGET.controls.thrustForward ||
				MEMORY.TARGET.controls.thrustBackward);
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

	return {
		TARGET_IN_RANGE: TARGET_IN_RANGE(),
		TARGET_CLOSE: TARGET_CLOSE(),
		TARGET_TOO_CLOSE: TARGET_TOO_CLOSE(),
		TARGET_EVADING: TARGET_EVADING(),
		SHOULD_DODGE_LEFT: SHOULD_DODGE_LEFT(),
		AT_DESTINATION: AT_DESTINATION(),
	};
}