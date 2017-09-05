class EntitySticky extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.35;

		this.radius = data.radius || 4;
		this.targetId = undefined;	// Entity collided with
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

		this.collision = undefined;

		ENT.stageContainer.addChild(this.sprite);
		this.triggers.stick = this.onStick.bind(this);

	}

	onStick(info) {
		this.stuck = true;
		this.targetId = (info.targetId);
		var target = ENT.getById(this.targetId);
		this.localX = target.x - info.collision.x;
		this.localY = target.y - info.collision.y;
		this.initialTargetRotation = target.rotation;
		this.collisionAngle = info.collision.angle;
		this.collision = info.collision;

		console.log("local: (" + this.localX + ", " + this.localY + ")");
		console.log("collision: (" + info.collision.x + ", " + info.collision.y + ")");
		console.log("target: (" + target.x + ", " + target.y + ")");
		console.log("calculated pos: (" + (target.x - this.localX) + ", " + (target.y + this.localY) + ")");
	}

	update() {
		super.update();
		//console.log(this.sprite.x);
		var target = ENT.getById(this.targetId);
		if (this.stuck && target.sprite !== null) {
			// attach was acting fucky, replicating functionality here
			// to understand whats goin on, once working will revert to
			// PIXI.Sprite.attach

			target.sprite.attach(this.sprite, this.localX, this.localY);

			
			//this.sprite.x = this.collision.x;
			//this.sprite.y = this.collision.y;
			// this.sprite.x = target.x - this.localX;
			// this.sprite.y = target.y + this.localY;
			// this.sprite.rotation =
			// 	target.rotation - this.initialTargetRotation +
			// 	this.collisionAngle;
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