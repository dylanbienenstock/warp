module.exports = class EntityBase {
	constructor(className, x, y, radius) {
		this.id = -1;
		this.className = className;
		this.x = x || 0;
		this.y = y || 0;
		this.lastX = this.x;
		this.lastY = this.y;
		this.radius = radius || 0;
	}
}