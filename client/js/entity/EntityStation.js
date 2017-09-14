class EntityStation extends EntityBase {
	constructor(data) {
		super(data);

		this.color = data.color || 0x00FF00;
		this.radius = data.radius || 256;
		this.alignment = data.alignment || "neutral";

		this.container = new PIXI.ParticleContainer();
		this.container.x = this.x;
		this.container.y = this.y;

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
		this.sprite.width = this.radius * 2;
		this.sprite.height = this.radius * 2;
		this.sprite.anchor.set(0.5, 0.5);

		this.container.addChild(this.outerSprite, this.innerShadowSprite, this.sprite);
		ENT.stageContainer.addChild(this.container);
	}

	update() {
		super.update();

		this.outerSprite.rotation += 0.001;
		this.innerShadowSprite.rotation += 0.00025;
		this.sprite.rotation += 0.00025;
	}

	cull(visible) {
		this.outerSprite.visible = visible;
		this.innerShadowSprite.visible = visible;
		this.sprite.visible = visible;
	}

	remove() {
		this.container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
	}
}