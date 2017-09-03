class EntitySticky extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.8;

		this.radius = data.radius || 4;
		this.target = undefined;	// Entity collided with
		this.stuck = false;

		// For blast radius
		this.graphics = new PIXI.Graphics();
		// this.graphics.x = this.x;
		// this.graphics.y = this.y;
		// this.graphics.lineStyle(1, 0xFF0000, 1);

		// Position relative to collided entity
		this.localX = 0;
		this.localY = 0;
		this.angle = 0;

		// center the sprite's anchor point
		this.sprite = PIXI.Sprite.fromImage(""); //img/sticky.png
		this.sprite.anchor.set(0.5);
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.width = 10;  // this.radius eventually
		this.sprite.height = 10; //this.radius eventually

		ENT.stageContainer.addChild(this.sprite);
		this.triggers.stick = this.onStick.bind(this);

	}

	onStick(info) {
		console.log("I AM A STICKY AND I HAVE STUCK TO SOMETHING");
		console.log(info.collision);
		this.target = ENT.getById(info.targetId);
		this.stuck = true;
		this.localX = this.target.x - info.collision.x;
		this.localY = this.target.y - info.collision.y;

		// local coords seem to be correct
		console.log("local coords: " + this.localX + ',' + this.localY);
		this.angle = info.collision.angle;
	}

	update() {
		super.update();
		if (this.stuck && this.target.sprite !== null) {
			// this.target.sprite.attach(this.sprite, this.localX,
			// 	   this.localY, this.target.rotation - this.angle);

			// attach was acting fucky, replicating functionality here
			// to understand whats goin on, once working will revert to
			// PIXI.Sprite.attach

			this.sprite.x = this.target.x - this.localX; // this.localX
			this.sprite.y = this.target.y + this.localY;
			// need to calculate change in angle here
			// this.sprite.rotation += (this.target.rotation - this.angle);
		}

		else if(this.stuck && this.target.className === "Shield") {
			var player = this.target.owner;
			this.sprite.x = player.x + this.localX;
			this.sprite.y = player.y + this.localY;
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