class EntitySticky extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.8;

		this.radius = data.radius;

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;
		this.graphics.lineStyle(1, 0xFF0000, 1);

		this.sprite = this.graphics;
		ENT.stageContainer.addChild(this.graphics);
		this.triggers.stick = this.onStick.bind(this);

	}

	onStick(info) {
		console.log("I AM A STICKY AND I HAVE STUCK TO SOMETHING");
		//console.log(JSON.stringify(info));
	}

	update() {
		super.update();
	}

	cull(visible) {
		this.graphics.visible = visible;
	}

	remove() {
		ENT.stageContainer.removeChild(this.graphics);
		this.graphics.destroy();
	}
}