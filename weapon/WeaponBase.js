var ENT;
var PHYS;

class WeaponBase {
	constructor(player) {
		this.doNotNetwork = true;

		this.ownerId = player.id;
		this.fireInterval = 500;
		this.lastFire = 0;
	}

	fire(position, angle) { }
}

module.exports = function(__ENT, __PHYS) {
	ENT = __ENT;
	PHYS = __PHYS;

	return WeaponBase;
}