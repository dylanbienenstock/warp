class EntitySticky extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.8;

		this.radius = data.radius || 4;
		this.target = undefined;	// Entity collided with
		this.initialTargetRotation = undefined;
		this.stuck = false;

		// For blast radius / testing
		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x;
		this.graphics.y = this.y;
		this.graphics.lineStyle(1, 0xFF0000, 1);

		// Position relative to collided entity
		this.localX = 0;
		this.localY = 0;
		this.angle = 0;

		// center the sprite's anchor point
		this.sprite = PIXI.Sprite.fromImage("img/sticky.png");
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.zIndex = 50;
		this.sprite.width = 15;  // this.radius * 2 eventually (?)
		this.sprite.height = 15; //this.radius * 2 eventually (?)
		this.sprite.anchor.set(0.5, 0.5);
		// if these are small, will likely have to make sprite slightly
		// smaller than the actual hitbox radius so collision is still
		// detected properly

		ENT.stageContainer.addChild(this.sprite);
		this.triggers.stick = this.onStick.bind(this);

	}

	onStick(info) {
		this.stuck = true;
		this.target = ENT.getById(info.targetId);
		this.localX = this.target.x - info.collision.x;
		this.localY = this.target.y - info.collision.y;
		this.initialTargetRotation = this.target.rotation;
		this.collisionAngle = info.collision.angle;
	}

	update() {
		super.update();
		if (this.stuck && this.target.sprite !== null) {
			// attach was acting fucky, replicating functionality here
			// to understand whats goin on, once working will revert to
			// PIXI.Sprite.attach

			this.sprite.x = this.target.sprite.x + this.localX;
			this.sprite.y = this.target.sprite.y + this.localY;
			this.sprite.roation =
				this.target.rotation - this.initialTargetRotation +
				this.collisionAngle;
		}
	}

	cull(visible) {
		this.graphics.visible = visible;
	}

	remove() {
		ENT.stageContainer.removeChild(this.sprite);
		this.sprite.destroy();
	}
}