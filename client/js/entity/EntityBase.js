class EntityBase {
	constructor(data) {
		this.id = -1;
		this.className = data.className;
		this.sprite = null;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.radius = data.radius || 16;
	}

	update() {
		if (this.sprite != undefined) {
			this.sprite.x = lerp(this.sprite.x, this.x, ENT.lerpFactorPosition);
			this.sprite.y = lerp(this.sprite.y, this.y, ENT.lerpFactorPosition);
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

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}
}

