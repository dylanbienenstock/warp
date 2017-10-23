/*

USE TYPES
---------
"single" - Calls this.use once every time the control is pressed
"continuous" - Calls this.use repeatedly according to this.useInterval
"external" - Does not respond to controls, this.use is only called by other entities

*/

var ENT;
var PHYS;

class EquipmentBase {
	constructor(player) {
		this.doNotNetwork = true;

		this.ownerId = player.id;
		this.uses = 1;
		this.useType = "single";
		this.useInterval = 500;
		this.lastUse = 0;
	}

	update(position, angle, timeMult) { } // Called on every update regardless of control state
	remove() { } // Called when the player replaces it with another weapon
	beginUse(position, angle) { } // Called on control down
	endUse(position, angle) { } // Called on control up
	use(position, angle) { } // Called repeatedly according to this.useInterval / this.useType
}

module.exports = function(__ENT, __PHYS) {
	ENT = __ENT;
	PHYS = __PHYS;

	return EquipmentBase;
}