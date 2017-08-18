module.exports = function() {
	return class PhysicsObject {
		constructor(x, y, width, height) {
			this.id = -1;
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.children = [];
		}

		addChild(child) {
			this.children.push(child);
		}
	}
}