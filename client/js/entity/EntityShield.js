var hitDuration = 1250;

class EntityShield extends EntityBase {
	constructor(data) {
		super(data);

		this.ownerId = -1;
		this.hits = [];
		this.triggers.hit = this.onHit.bind(this);
	}

	onHit(data) {
		var sprite = new PIXI.Sprite(PIXI.loader.resources["shield"].texture);
		sprite.anchor.set(1, 0.5);
		sprite.width = 32;
		sprite.height = 32;
		sprite.rotation = data.angle;

		var entity = ENT.getById(this.ownerId);

		if (entity != null) {
			var hit = {
				time: Date.now(),
				sprite: sprite,	
				rotationOffset: data.angle - entity.sprite.rotation
			};

			this.hits.push(hit);

			ENT.stageContainer.addChild(sprite);
		}
	}

	update() {
		super.update();

		var entity = ENT.getById(this.ownerId);

		if (entity != null) {
			for (var i = this.hits.length - 1; i >= 0; i--) {
				var hit = this.hits[i];
				var timeSinceHit = Date.now() - hit.time;

				if (timeSinceHit >= hitDuration) {
					ENT.stageContainer.removeChild(this.hits[i].sprite);
					this.hits[i].sprite.destroy();
					this.hits.splice(i, 1);

					continue;
				}

				var center = entity.sprite.getCenter();

				hit.sprite.alpha = (hitDuration - timeSinceHit) / hitDuration;
				hit.sprite.position.x = center.x;
				hit.sprite.position.y = center.y;
				hit.sprite.rotation = entity.sprite.rotation + hit.rotationOffset;
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