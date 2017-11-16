var lineIntersect = require("line-intersect");
var lineCircleIntersect = require("line-circle-collision");
var QuadTree = require("../physics/QuadTree.js")();
var io;
var physicsDebug;

const velocityDampeningFactor = 0.9;
const velocitySleepLimit = 0.09;

module.exports = function(__io, __physicsDebug) {
	io = __io;
	physicsDebug = __physicsDebug;

	return new PhysicsManager();
}

class PhysicsManager {
	constructor() {
		this.Physics = null;

		this.nextId = 0;
		this.boundaryRadius = Math.pow(2, 14);
		this.physicsObjects = [];
		this.physicsObjectOwners = {};
		this.collisions = [];

		this.CollisionGroup = require("../physics/CollisionGroup.js");

		this.QuadTree = new QuadTree(-this.boundaryRadius, -this.boundaryRadius, this.boundaryRadius * 2, 0);
	}

	new(className, data) {
		return new this.Physics[className](data);
	}

	create(entity, physicsObject) {
		physicsObject.id = this.nextId;
		this.nextId++;

		this.physicsObjects.push(physicsObject);
		this.physicsObjectOwners[physicsObject.id] = entity;

		this.getPhysicsInfo(physicsObject);
	}

	remove(physicsObject) {
		delete this.physicsObjectOwners[physicsObject.id];

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
		var allCircles = [];

		for (var i = physicsObject.children.length; i >= 0; i--) {
			var physicsObjectI = (i == physicsObject.children.length ? physicsObject : physicsObject.children[i]);

			if (physicsObjectI instanceof this.Physics.Box) {
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
			else if (physicsObjectI instanceof this.Physics.Circle) {
				minX = Math.min(physicsObjectI.localX - physicsObjectI.radius, minX);
				minY = Math.min(physicsObjectI.localY - physicsObjectI.radius, minY);
				maxX = Math.max(physicsObjectI.localX + physicsObjectI.radius, maxX);
				maxY = Math.max(physicsObjectI.localY + physicsObjectI.radius, maxY);

				allCircles.push({
					radius: physicsObjectI.radius,
					position: {
						x: physicsObject.x + physicsObjectI.localX,
						y: physicsObject.y + physicsObjectI.localY
					}
				});
			}
			else if (physicsObjectI instanceof this.Physics.Poly) {
				for (var i = physicsObjectI.lines.length - 1; i >= 0; i--) {
					var line = {};
					line.start = this.rotatePoint(physicsObjectI.lines[i].start.x, physicsObjectI.lines[i].start.y, physicsObject.rotation);
					line.end = this.rotatePoint(physicsObjectI.lines[i].end.x, physicsObjectI.lines[i].end.y, physicsObject.rotation);

					minX = Math.min(line.start.x, minX);
					minY = Math.min(line.start.y, minY);
					maxX = Math.max(line.start.x, maxX);
					maxY = Math.max(line.start.y, maxY);

					minX = Math.min(line.end.x, minX);
					minY = Math.min(line.end.y, minY);
					maxX = Math.max(line.end.x, maxX);
					maxY = Math.max(line.end.y, maxY);

					line.start.x += physicsObject.x;
					line.start.y += physicsObject.y;
					line.end.x += physicsObject.x;
					line.end.y += physicsObject.y;

					allLines.push(line);
				}
			}
		}

		return {
			lines: allLines,
			circles: allCircles,
			origin: {
				x: physicsObject.x,
				y: physicsObject.y
			},
			bounds: {
				center: {
					x: (minX + (maxX - minX) / 2) + physicsObject.x,
					y: (minY + (maxY - minY) / 2) + physicsObject.y
				},
				minX: minX + physicsObject.x,
				minY: minY + physicsObject.y,
				maxX: maxX + physicsObject.x,
				maxY: maxY + physicsObject.y,
			}
		};
	}

	checkLinesToLines(lines1, lines2) {
		for (var i = lines1.length - 1; i >= 0; i--) {
			var line1 = lines1[i];

			for (var i2 = lines2.length - 1; i2 >= 0; i2--) {
				var line2 = lines2[i2];

				var lineIntersectResult = lineIntersect.checkIntersection(
				  line1.start.x, line1.start.y, line1.end.x, line1.end.y,
				  line2.start.x, line2.start.y, line2.end.x, line2.end.y
				);

				if (lineIntersectResult.type == "intersecting") {
					return {
						type: "line",
						position: {
							x: lineIntersectResult.point.x,
							y: lineIntersectResult.point.y
						}
					};
				}
			}
		}

		return null;
	}

	checkLinesToCircles(lines, circles) {
		for (var i = lines.length - 1; i >= 0; i--) {
			var line = lines[i];
			var nearestPoint = [];

			for (var i2 = circles.length - 1; i2 >= 0; i2--) {
				var circle = circles[i2];
				var lineCircleIntersectResult = lineCircleIntersect([ line.start.x, line.start.y, ],
										[ line.end.x, line.end.y, ],
										[ circle.position.x, circle.position.y ], 
										circle.radius, nearestPoint);

				if (lineCircleIntersectResult)
				{
					return {
						type: "line-circle",
						position: {
							x: nearestPoint[0],
							y: nearestPoint[1]
						}
					};
				}
			}
		}

		return null;
	}

	checkCirclesToCircles(circles1, circles2) {
		for (var i = circles1.length - 1; i >= 0; i--) {
			var circle1 = circles1[i];

			for (var i2 = circles2.length - 1; i2 >= 0; i2--) {
				var circle2 = circles2[i2];
				var distance = Math.sqrt(Math.pow(circle2.position.x - circle1.position.x, 2) + Math.pow(circle2.position.y - circle1.position.y, 2));
				var angle = Math.atan2(circle2.position.y - circle1.position.y, circle2.position.x - circle1.position.x);

				if (distance <= (circle1.radius + circle2.radius)) {
					return {
						type: "circle",
						position: {
							x: -Math.cos(angle) * (distance / 2) + circle1.position.x,
							y: -Math.sin(angle) * (distance / 2) + circle1.position.y
						}
					};
				}
			}
		}

		return null;
	}

	// If temporary is true, the collisions will be returned and not raise any events
	checkForCollisions(physicsObject, temporary) { 
		if (!physicsObject.active || physicsObject.collisionGroup == "None") {
			if (temporary) {
				return [];
			}

			return;
		}

		var toReturn;

		if (temporary) {
			toReturn = [];
			physicsObject.info = this.getPhysicsInfo(physicsObject);
		}

		var likelyToCollide = this.QuadTree.retrieve(physicsObject.info.bounds);

		for (var i = likelyToCollide.length - 1; i >= 0; i--) {
			var physicsObject2 = likelyToCollide[i];

			if (!physicsObject2.active ||
				physicsObject.id == physicsObject2.id ||

				// Compare collision groups
				physicsObject2.collisionGroup == "None" ||
				!((physicsObject.collisionGroup == undefined || physicsObject2.collisionGroup == undefined) ||
				(this.CollisionGroup[physicsObject.collisionGroup].includes(physicsObject2.collisionGroup) &&
				this.CollisionGroup[physicsObject2.collisionGroup].includes(physicsObject.collisionGroup))) ||

				// Compare bounds
				physicsObject.info.bounds.minX > physicsObject2.info.bounds.maxX ||
				physicsObject2.info.bounds.minX > physicsObject.info.bounds.maxX ||
				physicsObject.info.bounds.minY > physicsObject2.info.bounds.maxY ||
				physicsObject2.info.bounds.minY > physicsObject.info.bounds.maxY) {

				continue;
			}

			var collision = this.checkCirclesToCircles(physicsObject.info.circles, physicsObject2.info.circles);

			if (collision == null) {
				collision = this.checkLinesToCircles(physicsObject.info.lines, physicsObject2.info.circles);
			}

			if (collision == null) {
				collision = this.checkLinesToCircles(physicsObject2.info.lines, physicsObject.info.circles);
			}

			if (collision == null) {
				collision = this.checkLinesToLines(physicsObject.info.lines, physicsObject2.info.lines);
			}

			if (collision != null) {
				collision.physicsObject = physicsObject;
				collision.with = physicsObject2;
				collision.angle = Math.atan2((collision.with.info.bounds.center.y + collision.with.totalVelocityY) - (collision.physicsObject.info.bounds.center.y - collision.physicsObject.totalVelocityY), 
								 (collision.with.info.bounds.center.x + collision.with.totalVelocityX) - (collision.physicsObject.info.bounds.center.x - collision.physicsObject.totalVelocityX));

				if (temporary) {
					toReturn.push(collision);
				} else {
					this.collisions.push(collision);
				}
			}
		}

		if (temporary) {
			return toReturn;
		}
	}

	getOwner(physicsObject) {
		return this.physicsObjectOwners[physicsObject.id];
	}

	acknowledgeCollisions() {
		for (var i = this.collisions.length - 1; i >= 0; i--) {
			var collision = this.collisions[i];
			var entity = this.getOwner(collision.physicsObject);
			var withEntity = this.getOwner(collision.with);

			if (entity != undefined && withEntity != undefined) {
				entity.collideWith(withEntity, collision);

				collision.__physicsObject = collision.physicsObject;
				collision.physicsObject = collision.with;
				collision.with = collision.__physicsObject;
				collision.angle = Math.atan2((collision.with.info.bounds.center.y + collision.with.totalVelocityY) - (collision.physicsObject.info.bounds.center.y - collision.physicsObject.totalVelocityY), 
									 (collision.with.info.bounds.center.x + collision.with.totalVelocityX) - (collision.physicsObject.info.bounds.center.x - collision.physicsObject.totalVelocityX));

				withEntity.collideWith(entity, collision);
			}
		}

		this.collisions.length = 0;
	}

	restrictToMap(physicsObject) {
		if (physicsObject.restrictToMap) {
			var outsideMap = false;

			for (var i = physicsObject.info.circles.length - 1; i >= 0; i--) {
				var circle = physicsObject.info.circles[i];

				if (Math.sqrt(Math.pow(circle.position.x, 2) + Math.pow(circle.position.y, 2)) >= (this.boundaryRadius - circle.radius)) {
					outsideMap = true;
					break;
				}
			}

			if (!outsideMap) {
				for (var i = physicsObject.info.lines.length - 1; i >= 0; i--) {
					var line = physicsObject.info.lines[i];

					if (Math.sqrt(Math.pow(line.start.x, 2) + Math.pow(line.start.y, 2)) >= this.boundaryRadius ||
						Math.sqrt(Math.pow(line.end.x, 2) + Math.pow(line.end.y, 2)) >= this.boundaryRadius) {
						
						outsideMap = true;
						break;
					}
				}
			}

			if (outsideMap) {
				var angle = Math.atan2(-physicsObject.y, -physicsObject.x);

				physicsObject.restrictX += Math.cos(angle) * 0.1;
				physicsObject.restrictY += Math.sin(angle) * 0.1;
			}

			physicsObject.inMap = !outsideMap;
		}
	}

	restVelocities(physicsObject) {
		if (Math.abs(physicsObject.restrictX) + Math.abs(physicsObject.restrictY) < velocitySleepLimit) {
			physicsObject.restrictX = 0;
			physicsObject.restrictY = 0;
		}

		if (Math.abs(physicsObject.velocityX) + Math.abs(physicsObject.velocityY) < velocitySleepLimit) {
			physicsObject.velocityX = 0;
			physicsObject.velocityY = 0;
		}
	}

	dampenVelocities(physicsObject, timeMult) {
		physicsObject.velocityX *= velocityDampeningFactor * Math.min(1 / timeMult, 1);
		physicsObject.velocityY *= velocityDampeningFactor * Math.min(1 / timeMult, 1);

		if (physicsObject.restrictToMap && physicsObject.inMap) {
			physicsObject.restrictX *= velocityDampeningFactor * Math.min(1 / timeMult, 1);
			physicsObject.restrictY *= velocityDampeningFactor * Math.min(1 / timeMult, 1);
		}
	}

	applyVelocities(physicsObject, timeMult) {
		physicsObject.x += physicsObject.totalVelocityX * timeMult;
		physicsObject.y += physicsObject.totalVelocityY * timeMult;

		if ((physicsObject.velocityX > 0 && physicsObject.thrustX < 0) || (physicsObject.velocityX < 0 && physicsObject.thrustX > 0)) {
			physicsObject.velocityX = Math.max(Math.min((physicsObject.velocityX + physicsObject.thrustX) * timeMult, 0), 0);
		}

		if ((physicsObject.velocityY > 0 && physicsObject.thrustY < 0) || (physicsObject.velocityY < 0 && physicsObject.thrustY > 0)) {
			physicsObject.velocityY = Math.max(Math.min((physicsObject.velocityY + physicsObject.thrustY) * timeMult, 0), 0);
		}
	}

	update(timeMult) {
		for (var i = this.physicsObjects.length - 1; i >= 0; i--) {
			var physicsObject = this.physicsObjects[i];

			if (physicsObject.active) {
				var shouldCalcInfo = false;
				physicsObject.sleeping = true;

				if (physicsObject.info == undefined || physicsObject.x != physicsObject.lastX || physicsObject.y != physicsObject.lastY) {
					shouldCalcInfo = true;
				}

				physicsObject.lastX = physicsObject.x;
				physicsObject.lastY = physicsObject.y;

				if (physicsObject instanceof this.Physics.Box) { 									// 0.05 rad ~= 3 deg
					if (!shouldCalcInfo && Math.abs(physicsObject.rotation - physicsObject.lastRotation) > 0.05) {
						shouldCalcInfo = true;
					}

					physicsObject.lastRotation = physicsObject.rotation;
				}

				if (shouldCalcInfo) {
					physicsObject.info = this.getPhysicsInfo(physicsObject);
					physicsObject.sleeping = false;
				}

				this.QuadTree.insert(physicsObject);
			}
		}

		for (var i2 = this.physicsObjects.length - 1; i2 >= 0; i2--) {
			var physicsObject = this.physicsObjects[i2];

			this.checkForCollisions(physicsObject);
			this.restrictToMap(physicsObject);
			this.applyVelocities(physicsObject, timeMult);
			this.restVelocities(physicsObject, timeMult);
			this.dampenVelocities(physicsObject, timeMult);
		}

		this.acknowledgeCollisions();

		if (physicsDebug) {
			io.emit("quadtree", this.QuadTree.getDebugInfo());
		}

		//this.QuadTree.clear();
	}

	clearQuadTree() {
		this.QuadTree.clear();
	}
}