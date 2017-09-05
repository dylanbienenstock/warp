var initialAlpha = 0.6;
window.showBounceOrbTrail = false;

class EntityBouncerOrb extends EntityBase {
	constructor(data) {
		super(data);

		this.lifespan = data.lifespan;
		this.alphaFalloff = 600;
		this.createdTime = Date.now();
		this.radius = data.radius || 36;
		this.initialRadius = this.radius;
		this.color = data.color || 0xFF00FF;
		this.angle = data.angle;

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;
		this.graphics.beginFill(this.color, 0.5);
		this.graphics.drawCircle(0, 0, this.radius / 3);
		this.graphics.drawCircle(0, 0, this.radius / 3 * 2);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();
		this.graphics.zIndex = 50;

		this.sprite = this.graphics;
		ENT.stageContainer.addChild(this.graphics);

		if (window.showBounceOrbTrail) {
			this.emitter = new ParticleEmitter({
				radius: this.radius - 4,
				x: this.sprite.x,
				y: this.sprite.y,
				minSpeed: 1, 
				maxSpeed: 2,
				angle: this.angle,
				angleSpread: 0,
				minLifespan: 300,
				maxLifespan: 600,
				startAlpha: initialAlpha,
				endAlpha: 0,
				startColor: this.color,
				endColor: this.color,
				minStartSize: 14,
				maxStartSize: 18,
				minEndSize: 6,
				maxEndSize: 8,
				spawnAmount: 4,
				zIndex: 49,
				blendMode: PIXI.BLEND_MODES.ADD
			});
		}
	}

	update() {
		super.update();

		var now = Date.now();
		var age = now - this.createdTime;
		var inverseAgeNormalized = Math.min(Math.max((this.lifespan - age) / this.alphaFalloff, 0), 1);

		this.radius = this.initialRadius + Math.sin(now / 100) * 4;

		this.graphics.clear();
		this.graphics.beginFill(this.color, 0.5);
		this.graphics.drawCircle(0, 0, this.radius / 3);
		this.graphics.drawCircle(0, 0, this.radius / 3 * 2);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();
		this.graphics.alpha = initialAlpha * inverseAgeNormalized;

		if (this.emitter != undefined) {
			this.emitter.x = this.sprite.x;
			this.emitter.y = this.sprite.y;
			this.emitter.startAlpha = initialAlpha * inverseAgeNormalized;
			this.emitter.spawnAmount = Math.floor(4 * inverseAgeNormalized);
		}

		addRadarDot(this.graphics.x, this.graphics.y, 0xFFFFFF, 1);
	}

	cull(visible) {
		this.graphics.visible = visible;
	}

	remove() {
		if (this.emitter != undefined) {
			this.emitter.remove();
		}
		
		ENT.stageContainer.removeChild(this.graphics);
		this.graphics.destroy();
	}
}