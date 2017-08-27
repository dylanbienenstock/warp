var pixelWidth = 16;
var pixelHeight = 8;

class EntityPlanet extends EntityBase {
	constructor(data) {
		super(data);

		this.radius = data.radius || 64;
		this.color = data.color || 0xFF6010;

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

		this.graphics.beginFill(this.color);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["planet:shadow"].texture);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = this.radius * 2;
		this.sprite.height = this.radius * 2;
		this.sprite.alpha = 0.5;
		this.sprite.mask = this.mask;
		this.sprite.x = this.x;
		this.sprite.y = this.y;

		this.container.addChild(this.graphics, this.mask, this.sprite);
		ENT.stageContainer.addChild(this.container);
	}

	update() {
		super.update();

		addRadarDot(this.sprite.x, this.sprite.y, this.color, 3);

		this.sprite.attach(this.graphics);
		this.sprite.attach(this.mask);
	}

	remove() {
		this.container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
	}
}