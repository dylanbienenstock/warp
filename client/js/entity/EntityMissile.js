class EntityMissile extends EntityBase {
	constructor(data) {
		super(data);

		this.angle = data.angle;

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["projectile:missile"].texture);
		this.sprite.anchor.set(1, 0.5);
		this.sprite.width = 80 * 0.7;
		this.sprite.height = 16 * 0.7;
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.zIndex = 50;
		this.sprite.rotation = this.angle;

		ENT.stageContainer.addChild(this.sprite);

		// this.emitter = new ParticleEmitter({
		// 	useParticleContainer: true,
		// 	radius: this.radius,
		// 	x: this.sprite.x,
		// 	y: this.sprite.y,
		// 	minSpeed: 0.1, 
		// 	maxSpeed: 0.15,
		// 	minLifespan: 400,
		// 	maxLifespan: 800,
		// 	startAlpha: 0.6,
		// 	endAlpha: 0,
		// 	minStartSize: 6,
		// 	maxStartSize: 8,
		// 	minEndSize: 4,
		// 	maxEndSize: 6,
		// 	spawnAmount: 2,
		// 	zIndex: 49,
		// 	blendMode: PIXI.BLEND_MODES.NORMAL
		// });
	}

	update() {
		super.update();
		this.sprite.rotation = lerpAngle(this.sprite.rotation, this.angle, 0.7);
		
		// this.emitter.x = this.sprite.x;
		// this.emitter.y = this.sprite.y;
	}

	cull(visible) {
		this.sprite.visible = visible;
	}

	remove() {
		//this.emitter.remove();
		ENT.stageContainer.removeChild(this.sprite);
		this.sprite.destroy();
	}
}