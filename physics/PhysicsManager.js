var io;

class PhysicsManager {
	constructor() {
		this.nextId = 0;
		this.physicsObjects = [];

		this.PhysicsObject = require("../physics/PhysicsObject.js")();
	}

	create(physicsObject) {
		this.physicsObjects.push(physicsObject);
	}

	rectangleToCorners(x, y, width, height) {
		return [
			{ x: x, y: y },					// Top left
			{ x: x + width, y: y }, 		// Top right
			{ x: x, y: y + height }, 		// Bottom left
			{ x: x + width, y: y + height } // Bottom right
		];
	}

	cornersToLines(corners) {
		return [
			{ start: corners[0], end: corners[1] }, // Top
			{ start: corners[1], end: corners[3] }, // Right
			{ start: corners[2], end: corners[3] }, // Bottom
			{ start: corners[0], end: corners[2] }  // Left
		];
	}

	rotatePoint(x, y, rotation, originX, originY) {
		var x2 = originX | 0;
		var y2 = originY | 0;

		return {
        	x: Math.cos(rotation) * (x - x2) - Math.sin(rotation) * (y - y2) + x2,
        	y: Math.sin(rotation) * (x - x2) + Math.cos(rotation) * (y - y2) + y2
   		};
	}

	getPhysicsInfo(physicsObject, x, y, rotation) {
		var minX = 0;
		var minY = 0;
		var maxX = 0;
		var maxY = 0;

		var lines = [];

		for (var i = physicsObject.children.length; i >= 0; i--) {
			var rectangle = (i == physicsObject.children.length ? physicsObject : physicsObject.children[i]);
			var corners = rectangleToCorners(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

			for (var i = corners.length - 1; i >= 0; i--) {
				var corner = corners[i];
				corner = rotatePoint(corner.x, corner.y, rotation);

				minX = Math.min(corner.x, minX);
				minY = Math.min(corner.y, miny);
				maxX = Math.max(corner.x, maxX);
				maxY = Math.max(corner.y, maxY);
			}

			lines.push(cornersToLines(corners));
		}

		return {
			lines: lines,
			bounds: {
				minX: minX,
				minY: minY,
				maxX: maxX,
				maxY: maxY
			}
		};
	}
}

module.exports = function(__io) {
	io = __io;

	return new PhysicsManager();
}