var ENT;
var PHYS;

class EntityBase {
	constructor(className) {
		this.id = -1;
		this.className = className;
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
	}

	create() {

	}

	remove() {
		if (this.physicsObject != undefined) {
			PHYS.remove(this.physicsObject);
		}
	}

	update() {
		if (this.physicsObject != undefined) {
			this.x = this.physicsObject.x;
			this.y = this.physicsObject.y;
			this.rotation = this.physicsObject.rotation;
		}
	}

	network() {

	}

	collideWith(entity, collision) {

	}
}

module.exports = function(__ENT, __PHYS) {
	ENT = __ENT;
	PHYS = __PHYS;

	return EntityBase;
}