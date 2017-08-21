var io;

module.exports = function(__io) {
	io = __io;

	return new PhysicsManager();
}

class PhysicsManager {
	constructor() {
		this.nextId = 0;
		this.physicsObjects = [];

		this.PhysicsObject = require("../physics/PhysicsObject.js")();
	}

	create(physicsObject) {
		this.physicsObjects.push(physicsObject);
	}

	remove(physicsObject) {
		for (var i = this.physicsObjects.length - 1; i >= 0; i--) {
			if (this.physicsObjects[i].id == physicsObject.id) {
				this.physicsObjects.splice(i, 1);

				break;
			}
		}
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

	getPhysicsInfo(physicsObject) {
		var minX = 0;
		var minY = 0;
		var maxX = 0;
		var maxY = 0;

		var allLines = [];

		for (var i = physicsObject.children.length; i >= 0; i--) {
			var physicsObjectI = (i == physicsObject.children.length ? physicsObject : physicsObject.children[i]);
			var corners = this.rectangleToCorners(physicsObjectI.localX, physicsObjectI.localY, physicsObjectI.width, physicsObjectI.height);

			for (var i2 = corners.length - 1; i2 >= 0; i2--) {
				corners[i2] = this.rotatePoint(corners[i2].x, corners[i2].y, physicsObject.rotation);
				var corner = corners[i2];

				minX = Math.min(corner.x, minX);
				minY = Math.min(corner.y, minY);
				maxX = Math.max(corner.x, maxX);
				maxY = Math.max(corner.y, maxY);
			}

			var lines = this.cornersToLines(corners);

			for (var i3 = lines.length - 1; i3 >= 0; i3--) {
				var line = lines[i3];

				line.start.x += physicsObject.x / 2;
				line.start.y += physicsObject.y / 2;
				line.end.x += physicsObject.x / 2;
				line.end.y += physicsObject.y / 2;

				allLines.push(line);
			}

		}

		return {
			lines: allLines,
			origin: {
				x: physicsObject.x,
				y: physicsObject.y
			},
			bounds: {
				minX: minX += physicsObject.x,
				minY: minY += physicsObject.y,
				maxX: maxX += physicsObject.x,
				maxY: maxY += physicsObject.y
			}
		};
	}

	checkForCollisions() {

	}

	update() {
		for (var i = this.physicsObjects.length - 1; i >= 0; i--) {
			var physicsObject = this.physicsObjects[i];

			physicsObject.x += physicsObject.totalVelocityX;
			physicsObject.y += physicsObject.totalVelocityY;
		}
	}
}