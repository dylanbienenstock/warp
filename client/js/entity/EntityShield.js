var hitDuration = 1250;
var precise = false;

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
				offset: {
					x: data.position.x - entity.sprite.x,
					y: data.position.y - entity.sprite.y
				},	
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
			var toRemove = [];

			for (var i = this.hits.length - 1; i >= 0; i--) {
				var hit = this.hits[i];
				var timeSinceHit = Date.now() - hit.time;

				if (timeSinceHit >= hitDuration) {
					ENT.stageContainer.removeChild(hit.sprite);
					this.hits[i].sprite.destroy();
					toRemove.push(i);

					continue;
				}

				hit.sprite.alpha = (hitDuration - timeSinceHit) / hitDuration;

				if (precise) {
					var position = rotatePoint(entity.sprite.x + hit.offset.x, entity.sprite.y + hit.offset.y,
											   entity.sprite.x, entity.sprite.y, entity.rotation + hit.rotationOffset);

					hit.sprite.position.x = position.x;
					hit.sprite.position.y = position.y;
					hit.sprite.rotation = entity.rotation + hit.rotationOffset;
				} else {
					var center = entity.sprite.getCenter();

					hit.sprite.position.x = center.x;
					hit.sprite.position.y = center.y;
					hit.sprite.rotation = entity.rotation + hit.rotationOffset;
				}
			}

			for (var i = toRemove.length - 1; i >= 0; i--) {
				this.hits.splice(toRemove[i], 1);
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