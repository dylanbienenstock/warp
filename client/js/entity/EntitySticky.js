class EntitySticky extends EntityBase {
	constructor(data) {
		super(data);

		this.lerpFactorPosition = 0.35;

		this.radius = data.radius || 4;
		this.stuck = false;
		this.graphics = new PIXI.Graphics(); // Can safely delete?
		this.sprite = PIXI.Sprite.fromImage("img/sticky.png");
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.zIndex = 101; // this needs to be greater than Player, standard for stacking projectiles?
		this.sprite.width = 15;   // this.radius * 2 eventually (?)
		this.sprite.height = 15;  //this.radius * 2 eventually (?)
		this.sprite.anchor.set(0.5, 0.5);

		this.targetId = undefined;
		this.distanceToTarget = 0;
		this.collision = undefined;
		this.initialTargetRotation = undefined;

		ENT.stageContainer.addChild(this.sprite);
		this.triggers.stick = this.onStick.bind(this);

	}

	onStick(info) {
		this.stuck = true;
		this.targetId = info.targetId;
		var target = ENT.getById(this.targetId);
		this.initialTargetRotation = target.rotation;
		this.collision = info.collision;

		this.distanceToTarget =
			((info.collision.x - target.sprite.x) ** 2 +
			 (info.collision.y - target.sprite.y) ** 2) ** 0.5;

		// need to do this for circular projectiles for some reason?
		// this.distanceToTarget *= 2;
		console.log("DISTANCE: " + this.distanceToTarget);
		console.log("ANGLE: " + (this.collision.angle));
	}

	update() {
		super.update();
		var target = ENT.getById(this.targetId);
		if (this.stuck && target.sprite !== null) {
			var deltaTargetAngle = target.rotation - this.initialTargetRotation;
			var stickyRotation = this.collision.angle + deltaTargetAngle;
			target.sprite.attach(this.sprite,
				-this.distanceToTarget * Math.cos(stickyRotation),
				-this.distanceToTarget * Math.sin(stickyRotation));
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