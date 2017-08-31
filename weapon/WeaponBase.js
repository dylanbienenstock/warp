var ENT;
var PHYS;

class WeaponBase {
	constructor(ownerId) {
		this.doNotNetwork = true;

		this.ownerId = ownerId;
		this.name = "Unnamed";
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