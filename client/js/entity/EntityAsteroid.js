class EntityAsteroid extends EntityBase {
	constructor(data) {
		super(data);

		this.triggers.hit = this.onHit.bind(this);

		this.radius = data.radius || 64;
		this.alive = true;
		this.hasDied = false;
		this.textureNumber = randomInt(0, 3);

		this.container = new PIXI.ParticleContainer();
		this.container.zIndex = 3;

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["asteroid:" + this.textureNumber].texture);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = this.radius * 2;
		this.sprite.height = this.radius * 2;
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.rotation = 2 * Math.PI * Math.random();
		this.sprite.rotationDelta = 0;

		this.outlineSprite = new PIXI.Sprite(PIXI.loader.resources["asteroid:" + this.textureNumber + ":outline"].texture);
		this.outlineSprite.anchor.set(0.5, 0.5);
		this.outlineSprite.width = this.sprite.width + 16;
		this.outlineSprite.height = this.sprite.height + 16;
		this.outlineSprite.x = this.x;
		this.outlineSprite.y = this.y;
		this.outlineSprite.rotation = 2 * Math.PI * Math.random();
		this.outlineSprite.rotationDelta = 0;

		this.overlaySprite = new PIXI.Sprite(PIXI.loader.resources["asteroid:" + this.textureNumber + ":overlay"].texture);
		this.overlaySprite.anchor.set(0.5, 0.5);
		this.overlaySprite.width = this.sprite.width + 16;
		this.overlaySprite.height = this.sprite.height + 16;
		this.overlaySprite.x = this.x;
		this.overlaySprite.y = this.y;
		this.overlaySprite.alpha = 0;

		if (Math.random() > 0.5) {
			this.sprite.rotationDelta = Math.random() * 0.01 - 0.005;
		}

		this.container.addChild(this.outlineSprite, this.sprite, this.overlaySprite);
		ENT.stageContainer.addChild(this.container);
	}

	onHit() {
		this.overlaySprite.alpha = 0.75;
	}

	update() {
		super.update();

		if (this.alive) {
			addRadarDot(this.sprite.x, this.sprite.y, 0x999999, 1);
		} else {
			this.hasDied = true;
		} 

		this.sprite.alpha = lerp(this.sprite.alpha, (this.alive ? 1 : 0), 0.05);
		this.outlineSprite.alpha = this.sprite.alpha;
		this.overlaySprite.alpha = lerp(this.overlaySprite.alpha, 0, 0.05);

		if (this.container.visible) {
			if (this.sprite.rotationDelta != undefined) {
				this.sprite.rotation += this.sprite.rotationDelta;
			}

			this.sprite.attach(this.outlineSprite);
			this.sprite.attach(this.overlaySprite);
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