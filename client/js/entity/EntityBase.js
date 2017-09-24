class EntityBase {
	constructor(data) {
		this.id = data.id || -1;
		this.className = data.className;
		this.sprite = null;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.rotation = data.rotation || 0;
		this.triggers = {};
		this.visible = true;
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

				if (!this.visible) {
					this.cull(true);
					this.visible = true;
				}
			} else {
				if (this.visible) {
					this.cull(false);
					this.visible = false;
				}
			}
		}
	}

	receiveProperties(data) {

	}

	cull(visible) {

	}

	remove() {
		
	}

	setProperties(data) {
		for (var property in data) {
			if (data.hasOwnProperty(property) && this.hasOwnProperty(property) && data[property] != undefined) {
				this[property] = data[property];
			}
		}
	}
}

