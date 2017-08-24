class EntityLaser extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.8;

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;
		this.graphics.lineStyle(2, 0xFF0000, 1);
		this.graphics.moveTo(-48, 0);
		this.graphics.lineTo(0, 0);
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