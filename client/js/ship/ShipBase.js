/*

Graphics data contructor format
-------------------------------

Required properties: 
bodySprite, shadowSprite, outlineSprite, forwardSprite, backwardSprite, overlaySprite

Value can be string or object, but bodySprite must be object with
texture, dimensions, and anchor defined

If value is string, it will copy dimensions and anchor from bodySprite

See ShipSkiff.js for example

*/

class ShipBase {
	constructor(alive, data) {
		this.scale = data.scale;
		data = ShipBase.processConstructorData(data);

		this.alive = alive;
		this.controls = null;
		this.width = 32;
		this.height = 32;
		this.x = 0;
		this.y = 0;
		this.boostLocalX = 0;
		this.boostLocalY = 0;
		this.boosting = false;
		this.rotation = 0;

		this.container = new PIXI.Container();
		this.container.zIndex = 99;

		this.shadowSprite = new PIXI.Sprite(PIXI.loader.resources[data.shadowSprite.texture].texture);
		this.shadowSprite.anchor.set(data.shadowSprite.anchor.x, data.shadowSprite.anchor.y);
		this.shadowSprite.width = data.shadowSprite.dimensions.width;
		this.shadowSprite.height = data.shadowSprite.dimensions.height;
		this.shadowSprite.alpha = 0.5;
		this.shadowSprite.renderable = this.alive;

		this.outlineSprite = new PIXI.Sprite(PIXI.loader.resources[data.outlineSprite.texture].texture);
		this.outlineSprite.anchor.set(data.outlineSprite.anchor.x, data.outlineSprite.anchor.y);
		this.outlineSprite.width = data.outlineSprite.dimensions.width;
		this.outlineSprite.height = data.outlineSprite.dimensions.height;
		this.outlineSprite.renderable = !this.alive;

		this.bodySprite = new PIXI.Sprite(PIXI.loader.resources[data.bodySprite.texture].texture);
		this.bodySprite.anchor.set(data.bodySprite.anchor.x, data.bodySprite.anchor.y);
		this.bodySprite.width = data.bodySprite.dimensions.width;
		this.bodySprite.height = data.bodySprite.dimensions.height;
		this.bodySprite.renderable = this.alive;

		this.overlaySprite = new PIXI.Sprite(PIXI.loader.resources[data.overlaySprite.texture].texture);
		this.overlaySprite.anchor.set(data.overlaySprite.anchor.x, data.overlaySprite.anchor.y);
		this.overlaySprite.width = data.overlaySprite.dimensions.width;
		this.overlaySprite.height = data.overlaySprite.dimensions.height;
		this.overlaySprite.alpha = 0;
		this.overlaySprite.renderable = this.alive;

		this.forwardSprite = new PIXI.Sprite(PIXI.loader.resources[data.forwardSprite.texture].texture);
		this.forwardSprite.anchor.set(data.forwardSprite.anchor.x, data.forwardSprite.anchor.y);
		this.forwardSprite.width = data.forwardSprite.dimensions.width;
		this.forwardSprite.height = data.forwardSprite.dimensions.height;

		this.backwardSprite = new PIXI.Sprite(PIXI.loader.resources[data.backwardSprite.texture].texture);
		this.backwardSprite.anchor.set(data.backwardSprite.anchor.x, data.backwardSprite.anchor.y);
		this.backwardSprite.width = data.backwardSprite.dimensions.width;
		this.backwardSprite.height = data.backwardSprite.dimensions.height;

		if (this.scale != undefined) {
			this.shadowSprite.scale.x = this.scale;
			this.shadowSprite.scale.y = this.scale;
			this.outlineSprite.scale.x = this.scale;
			this.outlineSprite.scale.y = this.scale;
			this.bodySprite.scale.x = this.scale;
			this.bodySprite.scale.y = this.scale;
			this.overlaySprite.scale.x = this.scale;
			this.overlaySprite.scale.y = this.scale;
			this.forwardSprite.scale.x = this.scale;
			this.forwardSprite.scale.y = this.scale;
			this.backwardSprite.scale.x = this.scale;
			this.backwardSprite.scale.y = this.scale;
		}

		this.container.addChild(this.shadowSprite,
								this.outlineSprite,
								this.bodySprite,
								this.forwardSprite,
								this.backwardSprite,
								this.overlaySprite);

		ENT.stageContainer.addChild(this.container);
	}

	static processConstructorData(data) {
		var processedData = {};
		var bodyData = data.bodySprite;

		for (var spriteDataKey in data) {
			if (data.hasOwnProperty(spriteDataKey) && spriteDataKey != "bodySprite" && spriteDataKey != "scale") {
				var spriteData = data[spriteDataKey];

				if (spriteData instanceof Object) {
					spriteData.dimensions = spriteData.dimensions || bodyData.dimensions;
					spriteData.anchor = spriteData.anchor || bodyData.anchor;
					processedData[spriteDataKey] = spriteData;
				} else { // String
					processedData[spriteDataKey] = {
						texture: spriteData,
						dimensions: bodyData.dimensions,
						anchor: bodyData.anchor
					};
				}
			}
		}

		processedData.bodySprite = bodyData;

		return processedData;
	}

	getBoostAttachmentPosition() {
		var localAttachmentPosition = rotatePoint(this.boostLocalX, this.boostLocalY, 0, 0, this.bodySprite.rotation);

		return {
			x: localAttachmentPosition.x + this.bodySprite.x,
			y: localAttachmentPosition.y + this.bodySprite.y
		}
	}

	onHit() {
		this.overlaySprite.alpha = 1;
		this.overlaySprite.tint = 0xFF4444;
	}

	onDeath() {
		this.alive = false;
		this.outlineSprite.renderable = true;
		this.shadowSprite.renderable = false;
	}

	update() {	
		if (!this.alive) {
			this.bodySprite.alpha = lerp(this.bodySprite.alpha, 0, 0.05);
			this.outlineSprite.renderable = true;
			this.bodySprite.attach(this.outlineSprite);
		}

		this.bodySprite.attach(this.shadowSprite, 2, 2);
		this.bodySprite.attach(this.overlaySprite);
		this.bodySprite.attach(this.forwardSprite);
		this.bodySprite.attach(this.backwardSprite);

		this.forwardSprite.renderable = this.alive && this.controls.thrustForward && !this.boosting;
		this.backwardSprite.renderable = this.alive && this.controls.thrustBackward;
		this.overlaySprite.alpha = lerp(this.overlaySprite.alpha, 0, 0.05);
	}

	remove() {
		this.container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
	}
}

