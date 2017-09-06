var oscillateAmount = 32;
var ringCount = 3;
var maxAlpha = 0.45;

class EntityBouncerAura extends EntityBase {
	constructor(data) {
		super(data);

		this.color = data.color || 0xFF00FF;
		this.radius = data.radius || 200;
		this.alpha = 0;
		this.destAlpha = 0;

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;
		this.graphics.zIndex = 49;

		this.sprite = this.graphics;
		ENT.stageContainer.addChild(this.graphics);
	}

	update() {
		super.update();

		this.alpha = lerp(this.alpha, this.destAlpha, 0.4);

		this.graphics.clear();
		this.graphics.beginFill(this.color, this.alpha * maxAlpha);

		for (var i = 0; i < ringCount; i++) {
			this.graphics.drawCircle(0, 0, (this.radius) / ringCount * i + Math.abs(Math.cos(Date.now() / 1000)) * oscillateAmount + oscillateAmount);
		}

		this.graphics.endFill();

		addRadarDot(this.graphics.x, this.graphics.y, 0xFFFFFF, 1);
	}

	cull(visible) {
		this.graphics.visible = visible;
	}

	remove() {
		ENT.stageContainer.removeChild(this.graphics);
		this.graphics.destroy();
	}
}