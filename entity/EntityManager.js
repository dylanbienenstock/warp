/*

/!\ PACKET FORMATS /!\
(client to server: ->, server to client: <-)
-------------------------------------------- 
-> "entity create"
<- "entity properties"

*/

class EntityManager {
	constructor(io) {
		this.io = io;
		this.entities = [];
		this.players = {};

		this.EntityBase = require("../entity/EntityBase.js");
		this.EntityPlayer = require("../entity/EntityPlayer.js");
	}

	create(entity, playerSocket) {
		if (entity.className != undefined) {
			//entity.ENT = this;
			entity.id = this.entities.length;
			this.entities.push(entity);

			var data = {};
			data.id = entity.id;

			for (var property in entity) {
				if (entity.hasOwnProperty(property)) {
					data[property] = entity[property];
				}
			}

			if (playerSocket != undefined && playerSocket != null) {
				playerSocket.broadcast.emit("entity create", data);

				data.isLocalPlayer = true;

				playerSocket.emit("entity create", data);
				this.players[playerSocket.id] = entity;
			} else {
				this.io.emit("entity create", data);
			}
		}
	}

	update() {
		for (var i = this.entities.length - 1; i >= 0; i--) {
			this.entities[i].update();
		}
	}

	getById(id) {
		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i].id == id) {
				return this.entities[i];
			}
		}
	}

	getByClassName(className) {
		var ents = [];

		for (var i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i].className == className) {
				ents.push(this.entities[i]);
			}
		}

		return ents;
	}

	getAll() {
		return this.entities;
	}

	sendProperties(entity, data) {
		var data2 = {};
		data2.id = entity.id;
		data2.properties = data;

		this.io.emit("entity set", data2);
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

module.exports = function(io) {
	return new EntityManager(io);
}