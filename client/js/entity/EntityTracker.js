class EntityTracker extends EntityBase {
	constructor(data) {
		super(data);

		this.radius = data.radius || 8;
		this.color = data.color || 0xFF0000;

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["projectile:orb"].texture);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = this.radius * 2 + 4;
		this.sprite.height = this.radius * 2 + 4;
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.tint = this.color;
		this.sprite.zIndex = 50;

		ENT.stageContainer.addChild(this.sprite);

		this.emitter = new ParticleEmitter({
			radius: this.radius,
			x: this.sprite.x,
			y: this.sprite.y,
			minSpeed: 0.1, 
			maxSpeed: 0.15,
			minLifespan: 500,
			maxLifespan: 1000,
			startAlpha: 0.6,
			endAlpha: 0,
			minStartSize: 6,
			maxStartSize: 8,
			minEndSize: 4,
			maxEndSize: 6,
			spawnAmount: 2,
			zIndex: 49,
			blendMode: PIXI.BLEND_MODES.NORMAL
		});
	}

	update() {
		super.update();
		this.emitter.x = this.sprite.x;
		this.emitter.y = this.sprite.y;

		addRadarDot(this.sprite.x, this.sprite.y, 0xFFFFFF, 1);
	}

	cull(visible) {
		this.sprite.visible = visible;
	}

	remove() {
		this.emitter.remove();
		ENT.stageContainer.removeChild(this.sprite);
		this.sprite.destroy();
	}
}