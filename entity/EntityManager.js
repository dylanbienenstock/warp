var io;
var PHYS;

module.exports = function(__io, __PHYS) {
	io = __io;
	PHYS = __PHYS;

	return new EntityManager();
}

class EntityManager {
	constructor() {
		this.entities = [];
		this.players = {};
		this.nextId = 0;
	}

	getNetworkableProperties(entity) {
		var data = {};

		for (var property in entity) {
			if (entity.hasOwnProperty(property) && !(entity[property] instanceof PHYS.PhysicsObject)) {
				data[property] = entity[property];
			}
		}

		return data;
	}

	create(entity, playerSocket) {
		if (entity.className != undefined) {
			entity.id = this.nextId;
			this.entities.push(entity);
			this.nextId++;

			var data = this.getNetworkableProperties(entity);

			if (playerSocket != undefined && playerSocket != null) {
				playerSocket.broadcast.emit("entity create", data);

				data.isLocalPlayer = true;

				playerSocket.emit("entity create", data);
				this.players[playerSocket.id] = entity;
			} else {
				io.emit("entity create", data);
			}
		}
	}

	remove(entity) {
		io.emit("entity remove", entity.id);

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
			this.entities[i].update();
		}
	}

	network() {
		for (var i = this.entities.length - 1; i >= 0; i--) {
			this.entities[i].network(this);
		}
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

	sendProperties(entity, data, to) {
		var data2 = {};
		data2.id = entity.id;
		data2.properties = data;

		(to || io).emit("entity set", data2);
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