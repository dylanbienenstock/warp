class EntityStation extends EntityBase {
	constructor(data) {
		super(data);

		this.radius = data.radius || 256;
		this.alignment = data.alignment || "neutral";
		this.color = 0xFFFF00;

		if (this.alignment == "good") {
			this.color = 0x00FF00;
		} else if (this.alignment == "evil") {
			this.color = 0xFF0000;
		}

		this.container = new PIXI.ParticleContainer();

		this.outerSprite = new PIXI.Sprite(PIXI.loader.resources["station:outer:" + this.alignment].texture);
		this.outerSprite.width = this.radius * 2;
		this.outerSprite.height = this.radius * 2;
		this.outerSprite.anchor.set(0.5, 0.5);

		this.innerShadowSprite = new PIXI.Sprite(PIXI.loader.resources["station:inner:shadow"].texture);
		this.innerShadowSprite.width = this.radius * 2;
		this.innerShadowSprite.height = this.radius * 2;
		this.innerShadowSprite.x = 2;
		this.innerShadowSprite.y = 2;
		this.innerShadowSprite.alpha = 0.5;
		this.innerShadowSprite.anchor.set(0.5, 0.5);

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["station:inner:" + this.alignment].texture);
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.width = this.radius * 2;
		this.sprite.height = this.radius * 2;
		this.sprite.anchor.set(0.5, 0.5);

		this.container.addChild(this.outerSprite, this.innerShadowSprite, this.sprite);
		ENT.stageContainer.addChild(this.container);
	}

	update() {
		super.update();

		addRadarDot(this.sprite.x, this.sprite.y, this.color, 2);
		addRadarDot(this.sprite.x, this.sprite.y, 0x000000, 4);
		addRadarDot(this.sprite.x, this.sprite.y, 0x888888, 6);

		if (this.container.visible) {
			this.outerSprite.position = this.sprite.position;
			this.innerShadowSprite.position = this.sprite.position;
		}

		this.outerSprite.rotation += 0.001;
		this.innerShadowSprite.rotation += 0.00025;
		this.sprite.rotation += 0.00025;
	}

	cull(visible) {
		this.container.visible = visible;
	}

	remove() {
		this.container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
	}
}