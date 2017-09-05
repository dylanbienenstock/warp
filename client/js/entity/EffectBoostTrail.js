var boostTrailLineDuration = 300;
var boostTrailMaxLineThickness = 12;

class EffectBoostTrail extends EntityBase {
	constructor(data) {
		super(data);

		this.ownerId = -1;
		this.color = 0x0000FF;
		this.graphics = new PIXI.Graphics();
		this.graphics.x = data.x;
		this.graphics.y = data.y;
		this.graphics.zIndex = 98;
		this.lines = [];
		this.lastLineEnd = {
			x: this.graphics.x,
			y: this.graphics.y
		};

		ENT.stageContainer.addChild(this.graphics);
	}

	update() {
		super.update();
		this.graphics.clear();

		var player = ENT.getById(this.ownerId);

		if (player != undefined && player instanceof EntityPlayer && player.boosting) {
			var lineEnd = player.ship.getBoostAttachmentPosition();

			this.graphics.beginFill(PIXI.utils.rgb2hex([ 0, 0.85, 1 ]));
			this.graphics.drawCircle(lineEnd.x - this.graphics.x, lineEnd.y - this.graphics.y, boostTrailMaxLineThickness / 2);
			this.graphics.endFill();

			this.lines.push({
				time: Date.now(),
				start: {
					x: this.lastLineEnd.x,
					y: this.lastLineEnd.y
				},
				end: lineEnd
			});

			this.lastLineEnd = lineEnd;
		}
		
		for (var i = this.lines.length - 1; i >= 0; i--) {
			var line = this.lines[i];
			var lineAge = Date.now() - line.time;
			var lineProgress = ((boostTrailLineDuration - lineAge) / boostTrailLineDuration)
			var lineThickness = Math.max(lineProgress * boostTrailMaxLineThickness, 0);
			var lineColorMod = Math.max(lineProgress, 0);
			var lineColor = PIXI.utils.rgb2hex([ 0, lineColorMod * 0.85, 1 ]);

			if (lineProgress > 0) {
				var angle = Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x);

				this.graphics.lineStyle(lineThickness, lineColor, 1);
				this.graphics.moveTo(line.start.x - this.graphics.x, line.start.y - this.graphics.y);
				this.graphics.lineTo(line.end.x - this.graphics.x + Math.cos(angle), line.end.y - this.graphics.y + Math.sin(angle));
			} else {
				this.lines.splice(i, 1);
			}
		}

		if (this.lines.length == 0) {
			ENT.removeEffect(this);
		}
	}

	remove() {
		ENT.stageContainer.removeChild(this.graphics);
		this.graphics.destroy();
	}
}