class EntityLaser extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.8;

		this.thickness = data.thickness || 2;
		this.color = data.color || 0xFF0000;
		this.length = data.length || 64;

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;
		this.graphics.lineStyle(this.thickness, this.color, 1);
		this.graphics.moveTo(-this.length, 0);
		this.graphics.lineTo(0, 0);
		this.graphics.rotation = this.rotation;

		this.sprite = this.graphics;
		ENT.stageContainer.addChild(this.graphics);

		ENT.createEffect(ENT.newEffect("LaserTrail", {
			ownerId: this.id,
			x: this.x,
			y: this.y
		}));

	}

	update() {
		super.update();
	}

	remove() {
		ENT.stageContainer.removeChild(this.graphics);
	}
}