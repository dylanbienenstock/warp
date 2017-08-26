class EntityPlayer extends EntityBase {
	constructor(data) {
		super(data);

		this.triggers.hit = this.onHit.bind(this);
		this.triggers.death = this.onDeath.bind(this);

		this.name = data.name;
		this.health = 100;
		this.shieldPower = 100;
		this.alive = data.alive;
		this.isLocalPlayer = false;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.rotation = data.rotation || 0;

		this.controls = {
			thrustForward: false,
			thrustBackward: false,
			thrustLeft: false,
			thrustRight: false,
			firePrimary: false,
			fireSecondary: false
		};

		this.outlineSprite = new PIXI.Sprite(PIXI.loader.resources["ship:default:outline"].texture);
		this.outlineSprite.anchor.set(0.678, 0.5);
		this.outlineSprite.width = 32;
		this.outlineSprite.height = 32;
		this.outlineSprite.visible = !this.alive;
		this.outlineSprite.x = this.x;
		this.outlineSprite.y = this.y;
		this.outlineSprite.rotation = this.rotation;

		this.shadowSprite = new PIXI.Sprite(PIXI.loader.resources["ship:default:shadow"].texture);
		this.shadowSprite.anchor.set(0.678, 0.5);
		this.shadowSprite.width = 40;
		this.shadowSprite.height = 40;
		this.shadowSprite.alpha = 0.5;
		this.shadowSprite.visible = this.alive;
		this.shadowSprite.x = this.x;
		this.shadowSprite.y = this.y;
		this.shadowSprite.rotation = this.rotation;

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["ship:default"].texture);
		this.sprite.anchor.set(0.678, 0.5);
		this.sprite.width = 32;
		this.sprite.height = 32;
		this.sprite.visible = this.alive;
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.rotation = this.rotation;

		this.overlaySprite = new PIXI.Sprite(PIXI.loader.resources["ship:default"].texture);
		this.overlaySprite.anchor.set(0.678, 0.5);
		this.overlaySprite.width = 32;
		this.overlaySprite.height = 32;
		this.overlaySprite.alpha = 0;
		this.overlaySprite.visible = this.alive;
		this.overlaySprite.x = this.x;
		this.overlaySprite.y = this.y;
		this.overlaySprite.rotation = this.rotation;

		this.thrustSprites = {};

		this.thrustSprites.forward = new PIXI.Sprite(PIXI.loader.resources["thrust:default:forward"].texture);
		this.thrustSprites.forward.anchor.set(0.475, 0.5);
		this.thrustSprites.forward.width = 44;
		this.thrustSprites.forward.height = 32;
		this.thrustSprites.forward.visible = this.alive;
		this.thrustSprites.forward.x = this.x;
		this.thrustSprites.forward.y = this.y;
		this.thrustSprites.forward.rotation = this.rotation;

		this.thrustSprites.backward = new PIXI.Sprite(PIXI.loader.resources["thrust:default:backward"].texture);
		this.thrustSprites.backward.anchor.set(0.678, 0.5);
		this.thrustSprites.backward.width = 32;
		this.thrustSprites.backward.height = 32;
		this.thrustSprites.backward.visible = this.alive;
		this.thrustSprites.backward.x = this.x;
		this.thrustSprites.backward.y = this.y;
		this.thrustSprites.backward.rotation = this.rotation;

		ENT.stageContainer.addChild(this.outlineSprite,
									this.shadowSprite,
									this.sprite,
									this.thrustSprites.forward,
									this.thrustSprites.backward,
									this.overlaySprite);
	}

	onHit() {
		this.overlaySprite.alpha = 1;
		this.overlaySprite.tint = 0xFF4444;
	}

	onDeath() {
		this.alive = false;
		this.outlineSprite.visible = true;
	}

	update() {
		super.update();

		if (this.isLocalPlayer) {
			centerOn(this.sprite);
		} else {
			this.sprite.rotation = lerpAngle(this.sprite.rotation, this.rotation, ENT.lerpFactorAngle);
		}

		this.thrustSprites.forward.visible = this.alive && this.controls.thrustForward;
		this.thrustSprites.backward.visible = this.alive && this.controls.thrustBackward;

		this.overlaySprite.alpha = lerp(this.overlaySprite.alpha, 0, 0.05);

		if (!this.alive) {
			this.sprite.alpha = lerp(this.sprite.alpha, 0, 0.05);
		}

		this.sprite.attach(this.outlineSprite);
		this.sprite.attach(this.shadowSprite, 2, 2);
		this.sprite.attach(this.overlaySprite);
		this.sprite.attach(this.thrustSprites.forward);
		this.sprite.attach(this.thrustSprites.backward);
	}

	remove() {
		ENT.stageContainer.removeChild(this.outlineSprite,
									this.shadowSprite,
									this.sprite,
									this.thrustSprites.forward,
									this.thrustSprites.backward,
									this.overlaySprite);
	}
}