class EntityBase {
	constructor(className, x, y, lerpFactor) {
		this.id = -1;
		this.className = className;
		this.sprite = null;
		this.x = x;
		this.y = y;
		this.lerpFactor = lerpFactor | 0.075;
	}

	update() {
		if (this.sprite != undefined) {
			this.sprite.x = lerp(this.sprite.x, this.x, this.lerpFactor);
			this.sprite.y = lerp(this.sprite.y, this.y, this.lerpFactor);
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

