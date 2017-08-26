var hitDuration = 1250;

class EntityShield extends EntityBase {
	constructor(data) {
		super(data);

		this.ownerId = data.ownerId;
		this.radius = data.radius || 32;
		this.hitSize = data.hitSize || data.radius || 32;
		this.hits = [];
		this.triggers.hit = this.onHit.bind(this);

		if (this.ownerId != undefined) {
			this.owner = ENT.getById(this.ownerId);
		}
	}

	onHit(data) {
		var sprite = new PIXI.Sprite(PIXI.loader.resources["shield"].texture);
		sprite.anchor.set(this.radius / this.hitSize, 0.5);
		sprite.width = this.hitSize;
		sprite.height = this.hitSize;
		sprite.rotation = data.angle;

		var hit = {
			time: Date.now(),
			sprite: sprite,
			rotationOffset: data.angle
		};

		if (this.owner != undefined) {
			hit.rotationOffset -= this.owner.sprite.rotation;
		}

		this.hits.push(hit);
		ENT.stageContainer.addChild(sprite);
	}

	update() {
		super.update();

		for (var i = this.hits.length - 1; i >= 0; i--) {
			var hit = this.hits[i];
			var timeSinceHit = Date.now() - hit.time;

			if (timeSinceHit >= hitDuration) {
				ENT.stageContainer.removeChild(this.hits[i].sprite);
				this.hits[i].sprite.destroy();
				this.hits.splice(i, 1);

				continue;
			}

			hit.sprite.alpha = (hitDuration - timeSinceHit) / hitDuration;

			if (this.owner != undefined) {
				var center = this.owner.sprite.getCenter();
				hit.sprite.position.x = center.x;
				hit.sprite.position.y = center.y;
				hit.sprite.rotation = this.owner.sprite.rotation + hit.rotationOffset;
			} else {
				hit.sprite.position.x = 0;
				hit.sprite.position.y = 0;
				hit.sprite.rotation = hit.rotationOffset;
			}
		}
	}

	remove() {
		for (var i = this.hits.length - 1; i >= 0; i--) {
			ENT.stageContainer.removeChild(this.hits[i].sprite);
			this.hits[i].sprite.destroy();
		}

		delete this.hits;
	}
}