var ENT;
var PHYS;

class WeaponBase {
	constructor(player) {
		this.doNotNetwork = true;

		this.ownerId = player.id;
		this.fireInterval = 500;
		this.lastFire = 0;
	}

	update(position, angle, timeMult) { } // Called on every update regardless of control state
	remove() { } // Called when the player replaces it with another weapon
	beginFire(position, angle) { } // Called on control down
	endFire(position, angle) { } // Called on control up
	fire(position, angle) { } // Called repeatedly according to this.fireInterval
}

module.exports = function(__ENT, __PHYS) {
	ENT = __ENT;
	PHYS = __PHYS;

	return WeaponBase;
}