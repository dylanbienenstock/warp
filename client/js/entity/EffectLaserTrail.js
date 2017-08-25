var lineDuration = 250;
var maxLineAlpha = 1;

class EffectLaserTrail extends EntityBase {
	constructor(data) {
		super(data);

		this.ownerId = -1;
		this.thickness = null;
		this.color = null;
		this.graphics = new PIXI.Graphics();
		this.graphics.x = data.x;
		this.graphics.y = data.y;
		this.lines = [];
		this.lastLineEnd = {
			x: 0,
			y: 0
		};

		ENT.stageContainer.addChild(this.graphics);
	}

	update() {
		super.update();

		var entity = ENT.getById(this.ownerId);

		if (entity != undefined) {
			if (this.thickness == null || this.color == null) {
				this.thickness = Math.max(entity.thickness / 2, 2);
				this.color = entity.color;
			}

			var lineEnd = {
				x: (entity.graphics.x - Math.cos(entity.graphics.rotation) * entity.length) - this.graphics.x,
				y: (entity.graphics.y - Math.sin(entity.graphics.rotation) * entity.length)- this.graphics.y
			};

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

		this.graphics.clear();
		
		for (var i = this.lines.length - 1; i >= 0; i--) {
			var line = this.lines[i];
			var lineAge = Date.now() - line.time;
			var lineAlpha = Math.max(((lineDuration - lineAge) / lineDuration) * maxLineAlpha, 0);

			if (lineAlpha > 0) {
				this.graphics.lineStyle(this.thickness, this.color, lineAlpha);
				this.graphics.moveTo(line.start.x, line.start.y);
				this.graphics.lineTo(line.end.x, line.end.y);
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