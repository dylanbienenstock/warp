var outlineRadius = 3;

class EntityPlanet extends EntityBase {
	constructor(data) {
		super(data);

		this.radius = data.radius || 64;
		this.orbitEntityId = data.orbitEntityId;
		this.orbitRadius = data.orbitRadius;
		this.skinInfo = data.skinInfo;
		this.colors = data.colors || [ 0x3280B4, 0x82C864, 0xFFFFFF ];

		if (this.colors[2] == null) {
			this.skinInfo.hasClouds = false;
		}

		this.container = new PIXI.Container();

		this.mask = new PIXI.Graphics();
		this.mask.x = this.x;
		this.mask.y = this.y;

		this.mask.beginFill(0xFFFFFF);
		this.mask.drawCircle(0, 0, this.radius);
		this.mask.endFill();

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;

		this.graphics.beginFill(0xFFFFFF, 0.16);
		this.graphics.drawCircle(0, 0, this.radius + outlineRadius + 12 * 1);
		this.graphics.drawCircle(0, 0, this.radius + outlineRadius + 12 * 2);
		this.graphics.drawCircle(0, 0, this.radius + outlineRadius + 12 * 3);
		this.graphics.endFill();

		this.graphics.beginFill(0x000000, 1);
		this.graphics.drawCircle(0, 0, this.radius + 3);
		this.graphics.endFill();

		this.graphics.beginFill(this.colors[0], 1);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();

		this.landSprite = new PIXI.extras.TilingSprite(
			PIXI.loader.resources["planet:" + this.skinInfo.id + ":land"].texture,
			this.radius * 4,
			this.radius * 2
		);
		this.landSprite.tileScale.x = this.radius / 128; 
		this.landSprite.tileScale.y = this.radius / 128; 
		this.landSprite.tilePosition.x = Math.random() * 256;;
		this.landSprite.tilePosition.y = 0;
		this.landSprite.mask = this.mask;
		this.landSprite.tint = this.colors[1];

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["planet:shadow"].texture);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = this.radius * 2;
		this.sprite.height = this.radius * 2;
		this.sprite.alpha = 0.5;
		this.sprite.mask = this.mask;
		this.sprite.x = this.x;
		this.sprite.y = this.y;

		if (this.skinInfo.hasClouds) {
			this.cloudsSprite = new PIXI.extras.TilingSprite(
				PIXI.loader.resources["planet:" + this.skinInfo.id + ":clouds"].texture,
				this.radius * 4,
				this.radius * 2
			);
			this.cloudsSprite.tileScale.x = this.radius / 128; 
			this.cloudsSprite.tileScale.y = this.radius / 128; 
			this.cloudsSprite.tilePosition.x = 0;
			this.cloudsSprite.tilePosition.y = 0;
			this.cloudsSprite.mask = this.mask;
			this.cloudsSprite.tint = this.colors[2];

			this.container.addChild(this.mask, this.graphics, this.landSprite, this.cloudsSprite, this.sprite);
		} else {
			this.container.addChild(this.mask, this.graphics, this.landSprite, this.sprite);
		}

		ENT.stageContainer.addChild(this.container);
	}

	update() {
		super.update();

		addRadarDot(this.sprite.x, this.sprite.y, 0xFFFFFF, 1, false, false);
		addRadarDot(this.sprite.x, this.sprite.y, 0x000000, 2, false, false);

		// ENT.getById(this.orbitEntityId, function(orbitEntity) {
		// 	addRadarRing(orbitEntity.sprite.x, orbitEntity.sprite.y, 0xFFFFFF, this.orbitRadius, true, false);
		// }.bind(this));

		if (this.container.visible) {
			this.landSprite.position.x = this.sprite.position.x - this.radius * 2;
			this.landSprite.position.y = this.sprite.position.y - this.radius;
			this.landSprite.tilePosition.x += 0.15;
			
			if (this.skinInfo.hasClouds) {
				this.landSprite.attach(this.cloudsSprite);
				this.cloudsSprite.tilePosition.x += 0.1;
			}

			this.sprite.attach(this.mask);
			this.sprite.attach(this.graphics);

			ENT.getById(this.orbitEntityId, function(orbitEntity) {
				this.sprite.rotation = Math.atan2(this.sprite.y - orbitEntity.sprite.y, this.sprite.x - orbitEntity.sprite.x);
			}.bind(this));
		}
	}

	cull(visible) {
		this.container.visible = visible;
	}

	remove() {
		this.container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
	}
}