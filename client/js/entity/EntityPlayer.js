class EntityPlayer extends EntityBase {
	constructor(data) {
		super(data);

		this.triggers.hit = this.onHit.bind(this);
		this.triggers.death = this.onDeath.bind(this);
		this.triggers.boost = this.onBoost.bind(this);

		this.name = data.name;
		this.health = 100;
		this.shieldPower = 100;
		this.boost = 100;
		this.boosting = false;
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
			boost: false,
			firePrimary: false,
			fireSecondary: false
		};

		this.container = new PIXI.Container();
		this.container.zIndex = 2;

		this.shadowSprite = new PIXI.Sprite(PIXI.loader.resources["ship:default:shadow"].texture);
		this.shadowSprite.anchor.set(0.678, 0.5);
		this.shadowSprite.width = 40;
		this.shadowSprite.height = 40;
		this.shadowSprite.alpha = 0.5;
		this.shadowSprite.visible = this.alive;
		this.shadowSprite.rotation = this.rotation;

		this.outlineSprite = new PIXI.Sprite(PIXI.loader.resources["ship:default:outline"].texture);
		this.outlineSprite.anchor.set(0.678, 0.5);
		this.outlineSprite.width = 32;
		this.outlineSprite.height = 32;
		this.outlineSprite.visible = !this.alive;
		this.outlineSprite.rotation = this.rotation;

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["ship:default"].texture);
		this.sprite.anchor.set(0.678, 0.5);
		this.sprite.width = 32;
		this.sprite.height = 32;
		this.sprite.visible = this.alive;
		this.sprite.rotation = this.rotation;

		this.overlaySprite = new PIXI.Sprite(PIXI.loader.resources["ship:default"].texture);
		this.overlaySprite.anchor.set(0.678, 0.5);
		this.overlaySprite.width = 32;
		this.overlaySprite.height = 32;
		this.overlaySprite.alpha = 0;
		this.overlaySprite.visible = this.alive;
		this.overlaySprite.rotation = this.rotation;

		this.thrustSprites = {};

		this.thrustSprites.forward = new PIXI.Sprite(PIXI.loader.resources["thrust:default:forward"].texture);
		this.thrustSprites.forward.anchor.set(0.475, 0.5);
		this.thrustSprites.forward.width = 44;
		this.thrustSprites.forward.height = 32;
		this.thrustSprites.forward.visible = this.alive;
		this.thrustSprites.forward.rotation = this.rotation;

		this.thrustSprites.backward = new PIXI.Sprite(PIXI.loader.resources["thrust:default:backward"].texture);
		this.thrustSprites.backward.anchor.set(0.678, 0.5);
		this.thrustSprites.backward.width = 32;
		this.thrustSprites.backward.height = 32;
		this.thrustSprites.backward.visible = this.alive;
		this.thrustSprites.backward.rotation = this.rotation;

		this.container.addChild(this.shadowSprite,
								this.outlineSprite,
								this.sprite,
								this.thrustSprites.forward,
								this.thrustSprites.backward,
								this.overlaySprite);

		ENT.stageContainer.addChild(this.container);

		this.createNametag();
	}

	onHit() {
		this.overlaySprite.alpha = 1;
		this.overlaySprite.tint = 0xFF4444;
	}

	onDeath() {
		this.alive = false;
		this.outlineSprite.visible = true;
		this.shadowSprite.visible = false;
	}

	onBoost() {
		this.boosting = true;

		var attachmentPosition = this.getBoostAttachmentPosition();

		ENT.createEffect(ENT.newEffect("BoostTrail", {
			ownerId: this.id,
			x: attachmentPosition.x,
			y: attachmentPosition.y
		}));
	}

	update() {
		super.update();

		if (this.alive) {
			addRadarDot(this.sprite.x, this.sprite.y, (this.isLocalPlayer ? 0x00FF00 : 0xFF0000), 2);
		}

		if (this.isLocalPlayer) {
			centerOn(this.sprite);
			this.container.zIndex = 3;
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

		this.updateNametag();
	}

	createNametag() {
		this.nameTag = document.createElement("span");
		this.nameTag.className = "nametag";
		this.nameTag.innerHTML = this.name;

		document.body.appendChild(this.nameTag);

		this.updateNametag();
	}

	updateNametag() {
		var nameTagPosition = ENT.stageContainer.toGlobal(this.sprite.position);
		var nameTagWidth = $(this.nameTag).outerWidth();
		var nameTagHeight = $(this.nameTag).outerHeight();

		nameTagPosition.x -= nameTagWidth / 2;
		nameTagPosition.y += nameTagHeight + 16 * window.zoom;

		if (window.showNameTags &&
			!this.isLocalPlayer && 
			((nameTagPosition.x + nameTagWidth > 0 && nameTagPosition.y + nameTagHeight > 0) ||
			(nameTagPosition.x < $(window).innerWidth() && nameTagPosition.y < $(window).innerHeight()))) {

			this.nameTag.style.display = "initial";
			$(this.nameTag).offset({
				left: nameTagPosition.x,
				top: nameTagPosition.y
			});
		} else {
			this.nameTag.style.display = "none"
		}
	}

	getBoostAttachmentPosition() {
		return {
			x: this.sprite.x + Math.cos(this.sprite.rotation) * 11,
			y: this.sprite.y + Math.sin(this.sprite.rotation) * 11
		};
	}

	remove() {
		this.container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
		this.container.destroy();

		document.body.removeChild(this.nameTag);
	}
}