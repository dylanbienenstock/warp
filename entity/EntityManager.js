var io;
var PHYS;
var physicsDebug;

module.exports = function(__io, __physicsDebug) {
	io = __io;
	physicsDebug = __physicsDebug;

	return new EntityManager();
}

class EntityManager {
	constructor() {
		this.entities = [];
		this.players = {};
		this.nextId = 0;
		this.Entity = null;
		this.toNetwork = null;
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

	new(data) {
		return new this.Entity[data.className](data);
	}

	type(className) {
		return this.Entity[className];
	}

	create(entity, playerSocket, creatingEntityPhysicsDebug) {
		if (entity.className != undefined) {
			if (entity.lifespan != undefined && entity.lifespan != null) {
				entity.createdTime = Date.now();
			}

			entity.id = this.nextId;
			this.entities.push(entity);
			this.nextId++;

			var data = this.getNetworkableProperties(entity);

			if (playerSocket != null) {
				data.playerSocketId = playerSocket.client.id;
			}

			io.emit("entity create", data);

			entity.create();

			if (physicsDebug && !creatingEntityPhysicsDebug && entity.physicsObject != undefined) {
				entity.physicsObject.debugEntity = this.create(this.new({
					className: "PhysicsDebug",
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

		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i].id == entity.id) {
				this.entities.splice(i, 1);

				break;
			}
		}

		for (var socketid in this.players) {
			if (this.players.hasOwnProperty(socketid)) {
				if (this.players[socketid].id == entity.id) {
					delete this.players[socketid];

					break;
				}
			}
		}
	}

	update() {
		for (var i = this.entities.length - 1; i >= 0; i--) {
			var entity = this.entities[i];

			entity.update();

			if (entity.lifespan != undefined && entity.lifespan != null && Date.now() - entity.createdTime >= entity.lifespan) {
				this.remove(entity);
			}
		}
	}

	network() {
		this.toNetwork = [];

		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i] != undefined) {
				this.entities[i].network(this);
			}
		}

		io.emit("entity set", this.toNetwork);

		//(to || io).emit("entity set", data2);
	}

	getPlayerById(id, callback) { // Callback returns socketid
		for (var socketid in this.players) {
			if (this.players.hasOwnProperty(socketid)) {
				if (this.players[socketid].id == id) {
					callback(socketid);

					return this.players[socketid];
				}
			}
		}

		return null;
	}

	getById(id, callback) {
		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i].id == id) {
				callback(this.entities[i]);

				return this.entities[i];
			}
		}

		return null;
	}

	getByClassName(className, callback) {
		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i].className == className) {
				callback(this.entities[i]);

				return this.entities[i];
			}
		}

		return null;
	}

	getAll() {
		return this.entities;
	}

	sendAllEntities(socket) {
		var allData = [];

		for (var i = this.entities.length - 1; i >= 0; i--) {
			allData.push(this.getNetworkableProperties(this.entities[i]));
		}

		socket.emit("entity list", allData);
	}

	sendProperties(entity, data) {
		var data2 = {};
		data2.id = entity.id;
		data2.properties = data;

		this.toNetwork.push(data2);
	}

	sendPositions() {
		for (var i = this.entities.length - 1; i >= 0; i--) {
			var entity = this.entities[i];

			this.sendProperties(entity, {
				x: entity.x,
				y: entity.y
			});
		}
	}
}