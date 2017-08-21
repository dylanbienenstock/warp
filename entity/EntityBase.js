var ENT;
var PHYS;

class EntityBase {
	constructor(className) {
		this.id = -1;
		this.className = className;
	}

	create() {

	}

	remove() {
		if (this.physicsObject != undefined && this.physicsObject != null) {
			PHYS.remove(this.physicsObject);
		}
	}

	update() {
		
	}

	network() {

	}

	collideWith(entity) {

	}
}

module.exports = function(__ENT, __PHYS) {
	ENT = __ENT;
	PHYS = __PHYS;

	return EntityBase;
}