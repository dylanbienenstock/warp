class EntityPlayer extends EntityBase {
	constructor(data) {
		super(data);

		this.triggers.hit = this.onHit.bind(this); 

		this.name = data.name;
		this.health = 100;
		this.shieldPower = 100;
		this.isLocalPlayer = false;
		this.x = 0;
		this.y = 0;
		this.rotation = 0;

		this.controls = {
			thrustForward: false,
			thrustBackward: false,
			thrustLeft: false,
			thrustRight: false,
			firePrimary: false,
			fireSecondary: false
		};

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["ship:default"].texture);
		this.sprite.anchor.set(0.678, 0.5);
		this.sprite.width = 32;
		this.sprite.height = 32;

		this.overlaySprite = new PIXI.Sprite(PIXI.loader.resources["ship:default"].texture);
		this.overlaySprite.anchor.set(0.678, 0.5);
		this.overlaySprite.width = 32;
		this.overlaySprite.height = 32;
		this.overlaySprite.alpha = 0;

		this.thrustSprites = {};

		this.thrustSprites.forward = new PIXI.Sprite(PIXI.loader.resources["thrust:default:forward"].texture);
		this.thrustSprites.forward.anchor.set(0.475, 0.5);
		this.thrustSprites.forward.width = 44;
		this.thrustSprites.forward.height = 32;

		this.thrustSprites.backward = new PIXI.Sprite(PIXI.loader.resources["thrust:default:backward"].texture);
		this.thrustSprites.backward.anchor.set(0.678, 0.5);
		this.thrustSprites.backward.width = 32;
		this.thrustSprites.backward.height = 32;

		ENT.stageContainer.addChild(this.sprite,
									this.thrustSprites.forward,
									this.thrustSprites.backward,
									this.overlaySprite);
	}

	onHit() {
		this.overlaySprite.alpha = 1;
		this.overlaySprite.tint = 0xFF4444;
	}

	update() {
		super.update();

		if (this.isLocalPlayer) {
			centerOn(this.sprite);
		} else {
			this.sprite.rotation = lerpAngle(this.sprite.rotation, this.rotation, ENT.lerpFactorAngle);
		}

		this.thrustSprites.forward.visible = this.controls.thrustForward;
		this.thrustSprites.backward.visible = this.controls.thrustBackward;

		this.overlaySprite.alpha = lerp(this.overlaySprite.alpha, 0, 0.05);

		this.sprite.attach(this.overlaySprite);
		this.sprite.attach(this.thrustSprites.forward);
		this.sprite.attach(this.thrustSprites.backward);
	}

	remove() {
		ENT.stageContainer.removeChild(this.sprite,
									this.thrustSprites.forward,
									this.thrustSprites.backward,
									this.overlaySprite);
	}
}