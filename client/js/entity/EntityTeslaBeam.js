class EntityTeslaBeam extends EntityBase {
	constructor(data) {
		super(data);

		this.ownerId = data.ownerId;
		this.active = false;
		this.targetIds = [];
		this.colors = data.colors || [ 0xFF0000 ];
		this.range = data.range || 300;

		this.container = new PIXI.Container();
		this.container.zIndex = 49;
		this.sprite = this.container;

		this.graphics = new PIXI.Graphics();

		this.container.addChild(this.graphics);
		ENT.stageContainer.addChild(this.container);
	}

	update() {
		super.update(false);

		this.graphics.clear();

		if (this.active) {
			ENT.getById(this.ownerId, function(owner) {
				var origin = owner.sprite.position;
				var targets = this.targetIds.map(function(targetId) {
					return ENT.getById(targetId);
				});

				targets.sort(function(a, b) {
					if (a.sprite == undefined || b.sprite == undefined) return 0;

					var distanceA = Math.sqrt(Math.pow(origin.x - a.sprite.x, 2) + Math.pow(origin.y - a.sprite.y, 2));
					var distanceB = Math.sqrt(Math.pow(origin.x - b.sprite.x, 2) + Math.pow(origin.y - b.sprite.y, 2));

					if (distanceA > distanceB) return 1;

					return -1;
				});

				this.drawCurve(owner, targets, 8, 0.3, 128, 8);
				this.drawCurve(owner, targets, 1, 0.5, 128, 8);
			}.bind(this));
		}
	}

	drawCurve(owner, targets, lineWidth, lineAlpha, curvature, maxOffset) {
		var origin = owner.sprite.position;

		this.colors.forEach(function(color) {
			var startPoint = origin;
			var lastToOriginAngle = owner.sprite.rotation;

			this.graphics.moveTo(startPoint.x, startPoint.y);
			this.graphics.lineStyle(lineWidth, color, lineAlpha);

			if (targets.length == 0) {
				var ninetyDeg = 90 * Math.PI / 180;
				var fakeRange = this.range * 0.75;

				var endPoint = {
					x: startPoint.x - Math.cos(lastToOriginAngle) * fakeRange,
					y: startPoint.y - Math.sin(lastToOriginAngle) * fakeRange,
				}

				var controlPoint1Offset = Math.random() * 16 - 8;
				var controlPoint2Offset = Math.random() * 16 - 8;

				var controlPoint1 = { 
					x: startPoint.x - Math.cos(lastToOriginAngle) * fakeRange * 0.25 + Math.cos(lastToOriginAngle + ninetyDeg) * controlPoint1Offset,
					y: startPoint.y - Math.sin(lastToOriginAngle) * fakeRange * 0.25 + Math.sin(lastToOriginAngle + ninetyDeg) * controlPoint1Offset,
				}

				var controlPoint2 = { 
					x: startPoint.x - Math.cos(lastToOriginAngle) * fakeRange * 0.75 + Math.cos(lastToOriginAngle + ninetyDeg) * controlPoint2Offset,
					y: startPoint.y - Math.sin(lastToOriginAngle) * fakeRange * 0.75 + Math.sin(lastToOriginAngle + ninetyDeg) * controlPoint2Offset,
				}

				this.graphics.bezierCurveTo(controlPoint1.x, controlPoint1.y,
											controlPoint2.x, controlPoint2.y,
											endPoint.x, endPoint.y);
			} else {
				for (let i = 0; i < targets.length; i++) {
					var target = targets[i];
					var targetX = target.x;
					var targetY = target.y;
					var nextTarget = targets[i + 1];

					if (target == undefined) continue;

					if (target.sprite == undefined) {
						ENT.getById(target.ownerId, function(owner) {
							targetX = owner.x;
							targetY = owner.y;
						});
					}

					var endPoint = {
						x: targetX + Math.random() * maxOffset,
						y: targetY + Math.random() * maxOffset
					}

					if (i == targets.length - 1) {
						endPoint = {
							x: targetX,
							y: targetY
						}
					}

					var toOriginAngle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

					var controlPoint1 = { 
						x: startPoint.x - Math.cos(lastToOriginAngle) * curvature + Math.random() * maxOffset,
						y: startPoint.y - Math.sin(lastToOriginAngle) * curvature + Math.random() * maxOffset
					}

					var controlPoint2 = { 
						x: endPoint.x + Math.cos(toOriginAngle) * curvature + Math.random() * maxOffset,
						y: endPoint.y + Math.sin(toOriginAngle) * curvature + Math.random() * maxOffset
					}

					this.graphics.bezierCurveTo(controlPoint1.x, controlPoint1.y,
												controlPoint2.x, controlPoint2.y,
												endPoint.x, endPoint.y);

					startPoint = endPoint;
					lastToOriginAngle = toOriginAngle;
				}
			}
		}.bind(this));
	}

	cull(visible) {
		//this.container.visible = visible;
	}

	remove() {
		container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
		this.container.destroy();
	}
}