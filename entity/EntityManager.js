var io;
var PHYS;
var physicsDebug;

module.exports = function(__io, __PHYS, __physicsDebug) {
	io = __io;
	PHYS = __PHYS;
	physicsDebug = __physicsDebug;

	return new EntityManager();
}

class EntityManager {
	constructor() {
		this.Entity = null;

		this.entities = [];
		this.entityIds = {};
		this.players = [];
		this.nextId = 0;
		this.networkNow = 0;
		this.toNetwork = null;
		this.physicsDebug = physicsDebug;
	}

	getNetworkableProperties(entity) {
		var data = {};

		for (var property in entity) {
			if (entity.hasOwnProperty(property) && entity[property] != undefined && !entity[property].doNotNetwork) {
				data[property] = entity[property];
			}
		}

		return data;
	}

	new(className, data) {
		data = data || {};
		data.className = className;
		
		return new this.Entity[className](data);
	}

	type(className) {
		return this.Entity[className];
	}

	create(entity, playerSocketId, creatingEntityPhysicsDebug) {
		if (entity.className != undefined) {
			if (entity.lifespan != undefined) {
				entity.createdTime = Date.now();
			}

			entity.id = this.nextId;
			this.entities.push(entity);
			this.entityIds[entity.id] = entity;
			this.nextId++;

			var data = this.getNetworkableProperties(entity);

			if (entity.className == "Player") {
				if (playerSocketId != undefined) {
					data.playerSocketId = playerSocketId;
				}
				
				this.players.push(entity);
			}

			io.emit("entity create", data);

			entity.create();

			if (physicsDebug && !creatingEntityPhysicsDebug && entity.physicsObject != undefined) {
				entity.physicsObject.debugEntity = this.create(this.new("PhysicsDebug", {
					physicsObject: entity.physicsObject
				}), null, true);
			}

			return entity;
		}
	}

	remove(entity, removingEntityPhysicsDebug) {
		io.emit("entity remove", entity.id);
		
		if (physicsDebug && !removingEntityPhysicsDebug && entity.physicsObject != undefined) {
			this.remove(entity.physicsObject.debugEntity, true);
		}

		entity.remove();
		delete this.entityIds[entity.id];

		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i].id == entity.id) {
				this.entities.splice(i, 1);

				break;
			}
		}

		for (var i = this.players.length - 1; i >= 0; i--) {
			if (this.players[i].id == entity.id) {
				this.players.splice(i, 1);

				break;
			}
		}
	}

	update(timeMult) {
		for (var i = this.entities.length - 1; i >= 0; i--) {
			var entity = this.entities[i];

			entity.update(timeMult);

			if (entity.lifespan != undefined && entity.lifespan != undefined && Date.now() - entity.createdTime >= entity.lifespan) {
				this.remove(entity);
			}
		}
	}

	network() {
		this.toNetwork = [];
		this.networkNow = Date.now();

		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i] != undefined && !this.entities[i].doNotNetwork) {
				this.entities[i].network(this);
			}
		}

		for (var i2 = this.players.length - 1; i2 >= 0; i2--) {
			var player = this.players[i2];
			var toNetworkSpecific = [];

			var vpInflate = 128;
			var vpMinX = player.physicsObject.x - (player.viewport.width / 2) - vpInflate;
			var vpMinY = player.physicsObject.y - (player.viewport.height / 2) - vpInflate;
			var vpMaxX = player.physicsObject.x + (player.viewport.width / 2) + vpInflate;
			var vpMaxY = player.physicsObject.y + (player.viewport.height / 2) + vpInflate;

			for (var i3 = this.toNetwork.length - 1; i3 >= 0; i3--) {
				var entity = this.toNetwork[i3].entity;

				if (entity.networkGlobally ||
					entity.nextNetworkGlobally ||
					entity.physicsObject == undefined ||
					entity.physicsObject.info == undefined) {

					entity.nextNetworkGlobally = false;
					toNetworkSpecific.push(this.toNetwork[i3].packet);
				} else {
					var entityBounds = entity.physicsObject.info.bounds;

					if (entityBounds.minX < vpMaxX && 
						entityBounds.maxX > vpMinX &&
						entityBounds.minY < vpMaxY &&
						entityBounds.maxY > vpMinY) {

						toNetworkSpecific.push(this.toNetwork[i3].packet);
					}
				}
			}

			if (io.sockets.connected[player.socketId] != undefined) {
				io.sockets.connected[player.socketId].emit("entity set", toNetworkSpecific);
			}
		}
	}

	sendProperties(entity, data) {
		var data2 = {
			entity: entity,
			packet: {
				id: entity.id,
				properties: data
			}
		};

		if (entity.physicsObject != undefined && entity.physicsObject.sleeping && this.networkNow - entity.lastNetworkPosition < 8000) {
			delete data2.packet.properties.x;
			delete data2.packet.properties.y;
			delete data2.packet.properties.rotation;
			this.lastNetworkPosition = this.networkNow;
		} else {
			this.lastNetworkPosition = this.networkNow;
		}

		this.toNetwork.push(data2);
	}

	sendAllEntities(socket) {
		var allData = [];

		for (var i = this.entities.length - 1; i >= 0; i--) {
			allData.push(this.getNetworkableProperties(this.entities[i]));
		}

		socket.emit("entity list", allData);
	}

	trigger(entity, trigger, data) {
		io.emit("entity trigger", {
			id: entity.id,
			trigger: trigger,
			triggerData: data
		});
	}

	getById(id, callback) {
		if (this.entityIds.hasOwnProperty(id)) {
			if (callback instanceof Function) {
				callback(this.entityIds[id]);
			}

			return this.entityIds[id];
		}
	}

	getAllPlayers() {
		return this.players;
	}

	getAllByClassName(className) {
		var found = [];

		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i].className == className) {
				found.push(this.entities[i]);
			}
		}

		return found;
	}

	getInRadius(x, y, radius) {
		var physicsObject = PHYS.new("Circle", {
			x: x,
			y: y,
			radius: radius
		});

		var collisions = PHYS.checkForCollisions(physicsObject, true);
		
		return collisions.map(function(collision) {
			return PHYS.getOwner(collision.with);
		});
	}

	getInCone(x, y, angle, radius, minDotProduct) {
		var physicsObjectCircle = PHYS.new("Circle", {
			x: x,
			y: y,
			radius: radius
		});

		var physicsObjectCircle2 = PHYS.new("Circle", {
			x: x,
			y: y,
			radius: 16
		});

		var polyAngle = (-0.5 * minDotProduct + 0.5) * 180 * (Math.PI / 180);

		var physicsObjectPoly = PHYS.new("Poly", {
			x: x,
			y: y,
			lines: [
				{
					start: { x: 0, y: 0 },
					end: {
						x: -Math.cos(angle + polyAngle) * radius,
						y: -Math.sin(angle + polyAngle) * radius
					}
				},
				{
					start: { x: 0, y: 0 },
					end: {
						x: -Math.cos(angle - polyAngle) * radius,
						y: -Math.sin(angle - polyAngle) * radius
					}
				},
				{
					start: {
						x: -Math.cos(angle + polyAngle) * radius,
						y: -Math.sin(angle + polyAngle) * radius
					},
					end: {
						x: -Math.cos(angle - polyAngle) * radius,
						y: -Math.sin(angle - polyAngle) * radius
					}
				}
			]
		});

		var collisionsCircle = PHYS.checkForCollisions(physicsObjectCircle, true);
		var collisionsCircle2 = PHYS.checkForCollisions(physicsObjectCircle2, true);
		var collisionsPoly = PHYS.checkForCollisions(physicsObjectPoly, true);

		collisionsCircle = collisionsCircle.filter(function(collision) {
			var toEntityX = (x - collision.with.x);
			var toEntityY = (y - collision.with.y);
			var toEntityLength = Math.abs(Math.sqrt(toEntityX * toEntityX + toEntityY * toEntityY));
			toEntityX /= toEntityLength;
			toEntityY /= toEntityLength;

			var perspectiveX = Math.cos(angle);
			var perspectiveY = Math.sin(angle);
			var perspectiveLength = Math.abs(Math.sqrt(perspectiveX * perspectiveX + perspectiveY * perspectiveY));
			perspectiveX /= perspectiveLength;
			perspectiveY /= perspectiveLength;

			var dot = (toEntityX * perspectiveX) + (toEntityY * perspectiveY);

			return dot >= minDotProduct;
		});

		var entities = collisionsCircle
					   .concat(collisionsCircle2)
					   .concat(collisionsPoly)
					   .map(function(collision) {

			return PHYS.getOwner(collision.with);
		});

		var seenIds = [];

		for (var i = entities.length - 1; i >= 0; i--) {
			var entity = entities[i];

			if (entity == undefined || seenIds.includes(entity.id)) {
				entities.splice(i, 1);
			} else {
				seenIds.push(entity.id);
			}
		}

		return entities;
	}

	getAll() {
		return this.entities;
	}
}