var glowMaxRadius = 1024;
var glowMaxAlpha = 0.25;
var glowRings = 8;
var glowSpeedDivisor = 16;

class EntitySun extends EntityBase {
	constructor(data) {
		super(data);

		this.radius = data.radius || 512;
		this.color = data.color || 0xFFAA44;
		this.isBlackHole = data.isBlackHole;
		this.firstDraw = true;

		this.container = new PIXI.Container();

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;
		this.graphics.zIndex = -1;

		this.bodyGraphics = new PIXI.Graphics();
		this.bodyGraphics.x = this.x;
		this.bodyGraphics.y = this.y;

		this.bodyGraphics.beginFill(this.isBlackHole ? 0x000000 : this.color);
		this.bodyGraphics.drawCircle(0, 0, this.radius);
		this.bodyGraphics.endFill();

		this.sprite = this.graphics;

		this.container.addChild(this.graphics, this.bodyGraphics);
		ENT.stageContainer.addChild(this.container);
	}

	update() {
		super.update();

		addRadarZone(this.graphics.x, this.graphics.y, this.color, 2048, true);
		addRadarDot(this.graphics.x, this.graphics.y, (this.isBlackHole ? 0x000000 : this.color), this.radius, true);
		
		if (this.container.visible || this.firstDraw) {
			this.firstDraw == false;

			this.graphics.clear();
			var timeQuotient = Date.now() / glowSpeedDivisor;

			for (var i = 0; i < glowRings; i++) {
				timeQuotient += glowMaxRadius / glowRings;
				var glowRadius = timeQuotient % glowMaxRadius;

				if (this.isBlackHole) {
					glowRadius = glowMaxRadius - glowRadius;
				}

				var glowAlpha = 1 - glowRadius / glowMaxRadius;

				this.graphics.beginFill(this.color, glowAlpha * glowMaxAlpha);
				this.graphics.drawCircle(0, 0, this.radius + glowRadius);
				this.graphics.endFill();
			}
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