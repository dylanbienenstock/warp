class EntityPlayer extends EntityBase {
	constructor(data) {
		super(data);

		this.name = data.name;
		this.isLocalPlayer = false;
		this.x = 0;
		this.y = 0;
		this.angle = 0;
		this.controls = {
			thrustForward: false,
			thrustBackward: false,
			thrustLeft: false,
			thrustRight: false
		};

		if (data.isLocalPlayer) {
			this.isLocalPlayer = true;
			ENT.localPlayer = this;
		}

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["ship:default"].texture);
		this.sprite.anchor.set(0.678, 0.5);
		this.sprite.width = 32;
		this.sprite.height = 32;

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
									this.thrustSprites.backward);
	}

	update() {
		super.update();

		if (this.isLocalPlayer) {
			centerOn(this.sprite);
		} else {
			this.sprite.rotation = lerpAngle(this.sprite.rotation, this.angle, ENT.lerpFactorAngle);
		}

		this.thrustSprites.forward.visible = this.controls.thrustForward;
		this.thrustSprites.backward.visible = this.controls.thrustBackward;

		this.thrustSprites.forward.x = this.sprite.x;
		this.thrustSprites.forward.y = this.sprite.y;
		this.thrustSprites.backward.x = this.sprite.x;
		this.thrustSprites.backward.y = this.sprite.y;

		this.thrustSprites.forward.rotation = this.sprite.rotation;
		this.thrustSprites.backward.rotation = this.sprite.rotation;
	}

	remove() {
		ENT.stageContainer.removeChild(this.sprite,
									this.thrustSprites.forward,
									this.thrustSprites.backward);
	}
}