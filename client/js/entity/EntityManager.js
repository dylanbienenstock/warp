window.ENT = {};

var entities = [];

ENT.lerpFactorPosition = 0.15;
ENT.lerpFactorAngle = 0.2;

ENT.stageContainer;
ENT.localPlayer;

ENT.new = function(data) {
	var entity;

	switch (data.className) {
		case "Player":
			entity = new EntityPlayer(data);
			break;
		case "PhysicsDebug":
			entity = new EntityPhysicsDebug(data);
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

ENT.removeById = function(id) {
	for (var i = entities.length - 1; i >= 0; i--) {
		if (entities[i].id == id) {
			entities[i].remove();
			entities.splice(i, 1);

			break;
		}
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

ENT.remove = function(entity) {

}