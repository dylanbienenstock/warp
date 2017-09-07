class EntityLaser extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.65;

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
		this.graphics.zIndex = 50;

		this.sprite = this.graphics;
		ENT.stageContainer.addChild(this.graphics);

		ENT.createEffect(ENT.newEffect("LaserTrail", {
			ownerId: this.id,
			x: this.x,
			y: this.y
		}));

		if (data.createParticles) {
			this.emitter = new ParticleEmitter({
				radius: 5,
				x: this.graphics.x,
				y: this.graphics.y,
				minSpeed: 0.2, 
				maxSpeed: 0.3,
				minLifespan: 400,
				maxLifespan: 800,
				startAlpha: 0.6,
				endAlpha: 0,
				startColor: this.color,
				endColor: this.color,
				minStartSize: 10,
				maxStartSize: 12,
				minEndSize: 4,
				maxEndSize: 6,
				spawnAmount: 8,
				removeAfter: 8,
				zIndex: 101,
				blendMode: PIXI.BLEND_MODES.ADD
			});
		}
	}

	update() {
		super.update();

		addRadarDot(this.graphics.x, this.graphics.y, 0xFFFFFF, 1);
	}

	cull(visible) {
		this.graphics.visible = visible;
	}

	remove() {
		ENT.stageContainer.removeChild(this.graphics);
		this.graphics.destroy();
	}
}