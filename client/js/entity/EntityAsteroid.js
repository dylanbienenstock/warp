class EntityAsteroid extends EntityBase {
	constructor(data) {
		super(data);

		this.triggers.hit = this.onHit.bind(this);

		this.radius = data.radius || 64;
		this.alive = true;
		this.hasDied = false;

		this.container = new PIXI.Container();

		this.randomNumber = randomInt(0, 3);

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["asteroid:" + this.randomNumber].texture);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = this.radius * 2;
		this.sprite.height = this.radius * 2;
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.rotation = 2 * Math.PI * Math.random();
		this.sprite.rotationDelta = 0;

		this.overlaySprite = new PIXI.Sprite(PIXI.loader.resources["asteroid:" + this.randomNumber].texture);
		this.overlaySprite.anchor.set(0.5, 0.5);
		this.overlaySprite.width = this.radius * 2;
		this.overlaySprite.height = this.radius * 2;
		this.overlaySprite.x = this.x;
		this.overlaySprite.y = this.y;
		this.overlaySprite.alpha = 0;
		this.overlaySprite.tint = 0xFF4444;

		if (Math.random() > 0.5) {
			this.sprite.rotationDelta = Math.random() * 0.01 - 0.005;
		}

		this.container.addChild(this.sprite, this.overlaySprite);
		ENT.stageContainer.addChild(this.container);
	}

	onHit() {
		this.overlaySprite.alpha = 1;
	}

	update() {
		super.update();

		if (!this.alive) {
			this.hasDied = true;
		}

		this.sprite.rotation += this.sprite.rotationDelta;
		this.sprite.alpha = lerp(this.sprite.alpha, (this.alive ? 1 : 0), 0.05);
		this.overlaySprite.alpha = lerp(this.overlaySprite.alpha, 0, 0.05);

		this.sprite.attach(this.overlaySprite);

		if (this.alive) {
			addRadarDot(this.sprite.x, this.sprite.y, this.hasDied ? 0xFF0000 : 0x999999, 1);
		}
	}

	remove() {
		this.container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
	}
}