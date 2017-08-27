var lineDuration = 250;
var maxLineAlpha = 1;
var maxLineThickness = 12;

class EffectBoostTrail extends EntityBase {
	constructor(data) {
		super(data);

		this.ownerId = -1;
		this.color = 0xB200FF;
		this.graphics = new PIXI.Graphics();
		this.graphics.x = data.x;
		this.graphics.y = data.y;
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

		var entity = ENT.getById(this.ownerId);

		if (entity != undefined && entity instanceof EntityPlayer && entity.boosting) {
			var lineEnd = entity.getBoostAttachmentPosition();

			this.graphics.beginFill(this.color);
			this.graphics.drawCircle(lineEnd.x - this.graphics.x, lineEnd.y - this.graphics.y, maxLineThickness / 2);
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
			var lineAlpha = Math.max(((lineDuration - lineAge) / lineDuration) * maxLineAlpha, 0);
			var lineThickness = Math.max(((lineDuration - lineAge) / lineDuration) * maxLineThickness, 0);

			if (lineAlpha > 0) {
				this.graphics.lineStyle(lineThickness, this.color, lineAlpha);
				this.graphics.moveTo(line.start.x - this.graphics.x, line.start.y - this.graphics.y);
				this.graphics.lineTo(line.end.x - this.graphics.x, line.end.y - this.graphics.y);
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
	}
}