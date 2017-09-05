class Particle {
	constructor(data) {
		this.lifespan = data.lifespan;
		this.spawnTime = Date.now();
		this.position = data.position;
		this.speed = data.speed;
		this.angle = data.angle;
		this.speedDelta = data.speedDelta;
		this.angleDelta = data.angleDelta;
		this.startSize = data.startSize;
		this.endSize = data.endSize;

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["particle"].texture);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = this.startSize;
		this.sprite.height = this.startSize;
		this.sprite.x = this.position.x;
		this.sprite.y = this.position.y;
		this.sprite.blendMode = data.blendMode;

		if (data.color != undefined) {
			this.sprite.tint = data.color;
		}

		data.container.addChild(this.sprite);
	}
}