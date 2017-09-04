class ParticleEmitter {
	constructor(data) {
		this.id = -1;
		this.active = true;
		this.removed = false;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.startX = this.x;
		this.startY = this.y;
		this.angle = data.angle;
		this.angleSpread = data.angleSpread;
		this.angleSpreadDegrees = data.angleSpreadDegrees;
		this.radius = data.radius || 0;
		this.minLifespan = data.minLifespan || 250;
		this.maxLifespan = data.maxLifespan || 500;
		this.minSpeed = data.minSpeed || 0;
		this.maxSpeed = data.maxSpeed || 0;
		this.minStartSize = data.minStartSize || 6;
		this.maxStartSize = data.maxStartSize || 12;
		this.minEndSize = data.minEndSize || 2;
		this.maxEndSize = data.maxEndSize || 4;
		this.startColor = data.startColor || 0xFFFFFF;
		this.endColor = data.endColor || this.startColor;
		this.startAlpha = data.startAlpha || 1;
		this.endAlpha = data.endAlpha || 0.25;
		this.blendMode = data.blendMode || PIXI.BLEND_MODES.NORMAL;
		this.spawnInterval = data.spawnInterval || 1;
		this.spawnAmount = data.spawnAmount || 1;
		this.maxParticles = data.maxParticles || 256;
		this.totalParticlesCreated = 0;
		this.removeAfter = data.removeAfter;
		this.lastSpawnTime = 0;

		this.particles = [];
		this.container = new PIXI.Container();
		this.container.zIndex = data.zIndex || 1000;

		ENT.stageContainer.addChild(this.container);
		ENT.ParticleManager.addEmitter(this);
	}

	get zIndex() {
		return this.container.zIndex;
	}

	set zIndex(value) {
		this.container.zIndex = value;
	}

	update() {
		var now = Date.now();

		if (this.active && !this.removed) {
			if (now - this.lastSpawnTime >= this.spawnInterval &&
				this.particles.length < this.maxParticles) {

				for (var i = 0; i < this.spawnAmount; i++) {
					this.createParticle(now);
					this.totalParticlesCreated++;

					if (this.totalParticlesCreated >= this.removeAfter) {
						this.remove();
					}
				}

				this.lastSpawnTime = now;
			}
		}

		for (var i = this.particles.length - 1; i >= 0; i--) {
			var particle = this.particles[i];
			var life = particle.lifespan - (now - particle.spawnTime);
			var lifeNormalized = life / particle.lifespan;
			var inverseLifeNormalized = 1 - lifeNormalized;

			if (life <= 0) {
				this.container.removeChild(particle.sprite);
				particle.sprite.destroy();
				this.particles.splice(i, 1);
			} else {
				particle.sprite.x += -Math.cos(particle.angle) * particle.speed;
				particle.sprite.y += -Math.sin(particle.angle) * particle.speed;
				particle.sprite.width = lerp(particle.startSize, particle.endSize, inverseLifeNormalized);
				particle.sprite.height = particle.sprite.width;
				particle.sprite.alpha = lerp(this.startAlpha, this.endAlpha, inverseLifeNormalized);

				if (this.startColor != this.endColor) {
					var startColorRGB = PIXI.utils.hex2rgb(this.startColor);
					var endColorRGB = PIXI.utils.hex2rgb(this.endColor);
					var currentColorRGB = [];

					currentColorRGB[0] = lerp(startColorRGB[0], endColorRGB[0], inverseLifeNormalized);
					currentColorRGB[1] = lerp(startColorRGB[1], endColorRGB[1], inverseLifeNormalized);
					currentColorRGB[2] = lerp(startColorRGB[2], endColorRGB[2], inverseLifeNormalized);

					particle.sprite.tint = PIXI.utils.rgb2hex(currentColorRGB);
				}
			}
		}

		if (this.removed && this.particles.length == 0) {
			ENT.ParticleManager.removeEmitter(this);
		}
	}

	createParticle(now) {
		if (this.angle == undefined && this.angleDegrees != undefined) {
			this.angle = this.angleDegrees * Math.PI / 180;
		}

		var spawnPositionAngle = Math.random() * Math.PI * 2;
		var velocityAngle = Math.random() * Math.PI * 2;

		if (this.angle != undefined) {
			velocityAngle = this.angle;

			if (this.angleSpread == undefined && this.angleSpreadDegrees != undefined) {
				this.angleSpread = this.angleSpreadDegrees * Math.PI / 180;
			}

			velocityAngle -= this.angleSpread / 2;
			velocityAngle += this.angleSpread * Math.random();
		}

		this.particles.push(new Particle({
			container: this.container,
			lifespan: randomInRange(this.minLifespan, this.maxLifespan),
			spawnTime: now,
			x: this.x + -Math.cos(spawnPositionAngle) * this.radius * Math.random(),
			y: this.y + -Math.sin(spawnPositionAngle) * this.radius * Math.random(),
			speed: randomInRange(this.minSpeed, this.maxSpeed),
			angle: velocityAngle,
			startSize: randomInRange(this.minStartSize, this.maxStartSize),
			endSize: randomInRange(this.minEndSize, this.maxEndSize),
			color: this.startColor,
			blendMode: this.blendMode
		}));
	}

	remove() {
		this.removed = true;
	}
}