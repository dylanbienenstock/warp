window.ENT = {};

var entities = [];

ENT.stageContainer;
ENT.localPlayer;

ENT.new = function(data) {
	var entity;

	switch (data.className) {
		case "Player":
			entity = new EntityPlayer(data);
			break;
	}

	entity.setProperties(data);
	return entity;
}

ENT.create = function(entity) {
	if (entity.className != undefined) {
		entities.push(entity);
	}
}

ENT.update = function() {
	for (var i = entities.length - 1; i >= 0; i--) {
		entities[i].update();
	}
}

ENT.getById = function(id, callback) {
	for (var i = entities.length - 1; i >= 0; i--) {
		if (entities[i].id == id) {
			callback(entities[i]);

			return entities[i];
		}
	}

	return null;
}