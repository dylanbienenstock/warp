window.ENT = {};

var entities = [];
var entityIds = {};
var players = [];
var effects = [];
var nextEffectId = 0;

ENT.lerpFactorPosition = 0.375;
ENT.lerpFactorAngle = 0.2;

ENT.stageContainer;
ENT.localPlayer;

ENT.physicsDebug = true;

ENT.ParticleManager = new ParticleManager();

ENT.new = function(data) {
	var entity = new window.Entity[data.className](data);

	if (entity != undefined) {
		entity.setProperties(data);
	}
	
	return entity;
}

ENT.newEffect = function(className, data) {
	data.className = className;

	var effect = new window.Effect[className](data);

	if (effect != undefined) {
		effect.setProperties(data);
	}
	
	return effect;
}

ENT.create = function(entity) {
	if (entity != undefined) {
		entities.push(entity);
		entityIds[entity.id] = entity;

		if (entity instanceof EntityPlayer) {
			players.push(entity);
		}
	}

	return entity;
}

ENT.createEffect = function(effect) {
	if (effect != undefined) {
		effect.id = nextEffectId;
		nextEffectId++;

		effects.push(effect);
	}

	return effect;
}

ENT.remove = function(entity) {
	ENT.removeById(entity.id);
}

ENT.removeEffect = function(effect) {
	ENT.removeEffectById(effect.id);
}

ENT.removeById = function(id) {
	for (var i = players.length - 1; i >= 0; i--) {
		if (players[i].id == id) {
			players.splice(i, 1);
			
			break;
		}
	}

	for (var i2 = entities.length - 1; i2 >= 0; i2--) {
		if (entities[i2].id == id) {
			entities[i2].remove();
			entities.splice(i2, 1);

			break;
		}
	}

	delete entityIds[id];
}

ENT.removeEffectById = function(id) {
	for (var i = effects.length - 1; i >= 0; i--) {
		if (effects[i].id == id) {
			effects[i].remove();
			effects.splice(i, 1);

			break;
		}
	}
}

ENT.update = function() {
	ENT.ww = $(window).width();
	ENT.wh = $(window).height();

	for (var i = players.length - 1; i >= 0; i--) {
		players[i].update();
	}

	for (var i = entities.length - 1; i >= 0; i--) {
		if (entities[i].className != "Player") {
			entities[i].update();
		}
	}

	for (var i = effects.length - 1; i >= 0; i--) {
		effects[i].update();
	}

	ENT.ParticleManager.update();
}

// TO DO: Make get functions for effects

ENT.getById = function(id, foundCallback, notFoundCallback) {
	if (entityIds.hasOwnProperty(id)) {
		if (foundCallback instanceof Function) {
			foundCallback(entityIds[id]);
		}

		return entityIds[id];
	} else if (notFoundCallback instanceof Function) {
		notFoundCallback();
	}

	return null;
}

ENT.getAllPlayers = function() {
	return players;
}

ENT.getAllByClassName = function(className) {
	var entities2 = [];

	for (var i = entities.length - 1; i >= 0; i--) {
		if (entities[i].className == className) {
			entities2.push(entities[i]);
		}
	}

	return entities2;
}