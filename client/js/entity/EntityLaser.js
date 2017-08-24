class EntityLaser extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.8;

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;
		this.graphics.lineStyle(data.thickness, data.color, 1);
		this.graphics.moveTo(-data.length + 8, 0);
		this.graphics.lineTo(-8, 0);
		this.graphics.rotation = this.rotation;

		this.sprite = this.graphics;
		ENT.stageContainer.addChild(this.graphics);
	}

	update() {
		super.update();
	}

	remove() {
		ENT.stageContainer.removeChild(this.graphics);
	}
}