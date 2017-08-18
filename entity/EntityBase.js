var ENT;

class EntityBase {
	constructor(className, x, y, radius) {
		this.id = -1;
		this.className = className;
		this.x = x || 0;
		this.y = y || 0;
		this.rotation = 0;
		this.radius = radius || 16;
	}
}

module.exports = function(__ENT) {
	ENT = __ENT;

	return EntityBase;
}