var ENT;
var PHYS;

class ShipBase {
	constructor(player, physicsObjects) {
		this.doNotNetwork = true;

		this.ownerId = player.id;
		this.physicsObject = physicsObjects[0];
		this.health = 100;
		this.speed = 6;
		this.shield = null;
		this.shieldRadius = 32;
		this.shieldHitSize = 32;
		this.shieldDamageFactor = 0.5;
		this.boostFactor = 1.8;
		this.boostDeplete = 0.5;
		this.boostRegen = 0.3;

		for (var i = 1; i < physicsObjects.length; i++) {
			this.physicsObject.addChild(physicsObjects[i]);
		}

		player.physicsObject = this.physicsObject;

		PHYS.create(player, this.physicsObject);

		this.shield = ENT.create(ENT.new("Shield", {
			ownerId: this.ownerId,
			radius: this.shieldRadius,
			hitSize: this.shieldHitSize || this.shieldRadius,
			damageFactor: this.shieldDamageFactor
		}));
	}

	remove() {
		PHYS.remove(this.physicsObject);
		ENT.remove(this.shield);
	}

	getShootPosition() { }
}

module.exports = function(__ENT, __PHYS) {
	ENT = __ENT;
	PHYS = __PHYS;

	return ShipBase;
}