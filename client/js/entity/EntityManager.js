window.ENT = {};

var entities = [];
var effects = [];
var nextEffectId = 0;

ENT.lerpFactorPosition = 0.375;
ENT.lerpFactorAngle = 0.2;

ENT.stageContainer;
ENT.localPlayer;

ENT.physicsDebug = true;

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
	for (var i = entities.length - 1; i >= 0; i--) {
		if (entities[i].id == id) {
			entities[i].remove();
			entities.splice(i, 1);

			break;
		}
	}
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

	for (var i = entities.length - 1; i >= 0; i--) {
		entities[i].update();
	}

	for (var i = effects.length - 1; i >= 0; i--) {
		effects[i].update();
	}
}

// TO DO: Make get functions for effects

ENT.getById = function(id, callback) {
	for (var i = entities.length - 1; i >= 0; i--) {
		if (entities[i].id == id) {
			if (callback instanceof Function) {
				callback(entities[i]);
			}

			return entities[i];
		}
	}

	return null;
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