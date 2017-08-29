/*

Special entity variables
------------------------
* x, y, rotation: Used to send physics information to client
* triggers: Used to send trigger events to client
* lifespan: If set, the entity will be automatically removed after this many milliseconds
* createdTime: Set automatically if entity has lifespan property
* networkGlobally: Entities with this property will be networked to all clients regardless of position
* doNotNetwork: Entities with this property set to true will not be networked
				Properties of the entity may use this property as well

*/

class EntityBase {
	constructor(data) {
		this.id = data.id || -1;
		this.className = data.className;
		this.sprite = null;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.rotation = data.rotation || 0;
		this.triggers = {};
	}

	update() {
		if (this.sprite != undefined) {
			this.sprite.x = lerp(this.sprite.x, this.x, this.lerpFactorPosition || ENT.lerpFactorPosition);
			this.sprite.y = lerp(this.sprite.y, this.y, this.lerpFactorPosition || ENT.lerpFactorPosition);

			var bounds = this.sprite.getBounds();

			if (bounds.x < ENT.ww && 
				bounds.x + bounds.width > 0 &&
				bounds.y < ENT.wh &&
				bounds.y + bounds.height > 0) {

				this.sprite.visible = true;
			} else {
				this.sprite.visible = false;
			}
		}
	}

	remove() {
		
	}

	setProperties(data) {
		for (var property in data) {
			if (data.hasOwnProperty(property) && this.hasOwnProperty(property)) {
				this[property] = data[property];
			}
		}
	}
}

