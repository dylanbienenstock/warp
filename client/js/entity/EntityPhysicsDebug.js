class EntityPhysicsDebug extends EntityBase {
	constructor(data) {
		super(data);

		this.info = null;
		this.sleeping = false;

		this.graphics = new PIXI.Graphics();
		this.graphics.zIndex = 99999;

		ENT.stageContainer.addChild(this.graphics);
	}

	update() {
		super.update();

		this.graphics.visible = ENT.physicsDebug;

		if (this.info != undefined) {
			this.graphics.clear();
			this.graphics.lineStyle(1, (this.sleeping ?  0xFF0000 : 0x00FF00), 1);

			for (var i = 0; i < this.info.lines.length; i++) {
				var line = this.info.lines[i];

				this.graphics.moveTo(line.start.x, line.start.y);
				this.graphics.lineTo(line.end.x, line.end.y);
			}

			for (var i = this.info.circles.length - 1; i >= 0; i--) {
				var circle = this.info.circles[i];

				this.graphics.drawCircle(circle.position.x, circle.position.y, circle.radius);
			}

			this.graphics.lineStyle(1, 0xFFFF00, 0.5);

			this.graphics.moveTo(this.info.bounds.minX, this.info.bounds.minY);
			this.graphics.lineTo(this.info.bounds.maxX, this.info.bounds.minY);

			this.graphics.moveTo(this.info.bounds.minX, this.info.bounds.minY);
			this.graphics.lineTo(this.info.bounds.minX, this.info.bounds.maxY);

			this.graphics.moveTo(this.info.bounds.maxX, this.info.bounds.minY);
			this.graphics.lineTo(this.info.bounds.maxX, this.info.bounds.maxY);

			this.graphics.moveTo(this.info.bounds.minX, this.info.bounds.maxY);
			this.graphics.lineTo(this.info.bounds.maxX, this.info.bounds.maxY);

			this.graphics.lineStyle();
			this.graphics.beginFill(0xFF0000)

			this.graphics.drawCircle(this.info.origin.x, this.info.origin.y, 1);

			this.graphics.endFill();
		}
	}

	remove() {
		ENT.stageContainer.removeChild(this.graphics);
	}
}