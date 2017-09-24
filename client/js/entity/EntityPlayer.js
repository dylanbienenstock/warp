class EntityPlayer extends EntityBase {
	constructor(data) {
		super(data);

		this.triggers.changeShip = this.onChangeShip.bind(this);
		this.triggers.hit = this.onHit.bind(this);
		this.triggers.death = this.onDeath.bind(this);
		this.triggers.boost = this.onBoost.bind(this);
		this.triggers.lockBroken = this.onLockBroken.bind(this);
		this.triggers.endWarp = this.onEndWarp.bind(this);

		this.name = data.name;
		this.credits = data.credits || 0;
		this.health = 100;
		this.shieldPower = 100;
		this.boost = 100;
		this.boosting = false;
		this.alive = data.alive;
		this.isLocalPlayer = false;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.rotation = data.rotation || 0;

		this.warping = data.warping;
		this.minWarpDistance = data.minWarpDistance;
		this.maxWarpDistance = data.maxWarpDistance;
		this.warpPower = data.warpPower;

		this.controls = {
			thrustForward: false,
			thrustBackward: false,
			thrustLeft: false,
			thrustRight: false,
			boost: false,
			firePrimary: false,
			fireSecondary: false,
			fireSpecial: false
		};

		this.shipListing = data.shipListing;
		this.primaryWeaponListing = data.primaryWeaponListing;
		this.secondaryWeaponListing = data.secondaryWeaponListing;
		this.specialWeaponListing = data.specialWeaponListing;

		if (this.shipListing != undefined) {
			this.ship = new Ship[this.shipListing.className](this.alive);
		} else {
			this.ship = new Ship.Skiff(this.alive);
		}

		this.sprite = this.ship.bodySprite;
		this.ship.controls = this.controls;

		this.createNameTag();
	}

	onChangeShip(className) {
		if (Ship.hasOwnProperty(className)) {
			var newShip = new Ship[className](this.alive);
			newShip.bodySprite.x = this.ship.bodySprite.x;
			newShip.bodySprite.y = this.ship.bodySprite.y;

			this.ship.remove();
			this.ship = newShip;
			this.sprite = this.ship.bodySprite;
			this.ship.controls = this.controls;
		}
	}

	onHit() {
		this.ship.onHit();
	}

	onDeath() {
		this.health = 0;
		this.alive = false;
		this.ship.onDeath();

		if (this.isLocalPlayer) {
			window.warping = false;
		}
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

	onLockBroken() {
		window.lockedPlayerId = null;
	}

	onEndWarp() {
		window.warping = false;
	}

	update() {
		super.update();

		if (this.alive) {
			addRadarDot(this.ship.bodySprite.x, this.ship.bodySprite.y, (this.isLocalPlayer ? 0x00FF00 : 0xFF0000), 2);

			if (this.id == window.lockedPlayerId) {
				addRadarDot(this.ship.bodySprite.x, this.ship.bodySprite.y, 0x000000, 3);
				addRadarDot(this.ship.bodySprite.x, this.ship.bodySprite.y, 0xFF0000, 4);
			}
		}

		if (this.isLocalPlayer) {
			centerOn(this.ship.bodySprite);
			this.ship.container.zIndex = 100;
		} else {
			this.ship.bodySprite.rotation = lerpAngle(this.sprite.rotation, this.rotation, ENT.lerpFactorAngle);
		}

		this.ship.controls = this.controls;
		this.ship.alive = this.alive;
		this.ship.boosting = this.boosting;
		this.ship.update();

		this.updateNameTag();
	}

	receiveProperties(data) {
		if (this.isLocalPlayer) {
			delete data.controls;

			return data;
		}
	}

	cull(visible) {
		this.ship.container.visible = visible || this.isLocalPlayer;
	}

	createNameTag() {
		var nameTagStyle = new PIXI.TextStyle({
			fontFamily: "Source Code Pro",
			fontSize: 16,
			fill: "#FFFFFF",
			padding: 4,
			dropShadow: true,
			dropShadowColor: "#000000",
			dropShadowBlur: 8,
			dropShadowDistance: 0
		});

		this.nameTag = new PIXI.Text(this.name, nameTagStyle);
		this.nameTag.cacheAsBitmap = true;
		this.nameTagMetrics = PIXI.TextMetrics.measureText(this.name, nameTagStyle);

		ENT.nameTagContainer.addChild(this.nameTag);
	}

	updateNameTag() {
		if (!this.isLocalPlayer) {
			var nameTagPosition = ENT.stageContainer.toGlobal(this.ship.bodySprite.position);
			var nameTagWidth = Math.floor(this.nameTagMetrics.width);
			var nameTagHeight = this.nameTagMetrics.height;

			nameTagPosition.x -= nameTagWidth / 2;
			nameTagPosition.y += (nameTagHeight + 4) * window.currentZoom;

			nameTagPosition.x = Math.floor(nameTagPosition.x);
			nameTagPosition.y = Math.floor(nameTagPosition.y);

			if (window.showNameTags &&
				((nameTagPosition.x + nameTagWidth > 0 && nameTagPosition.y + nameTagHeight > 0) ||
				(nameTagPosition.x < ENT.ww && nameTagPosition.y < ENT.wh))) {

				this.nameTag.visible = true;
				this.nameTag.position = nameTagPosition;
			} else {
				this.nameTag.visible = false;
			}
		} else {
			this.nameTag.visible = false;
		}
	}

	getBoostAttachmentPosition() {
		return {
			x: this.ship.bodySprite.x + Math.cos(this.ship.bodySprite.rotation) * 11,
			y: this.ship.bodySprite.y + Math.sin(this.ship.bodySprite.rotation) * 11
		};
	}

	remove() {	
		this.sprite.destroy();
		this.ship.remove();
		ENT.nameTagContainer.removeChild(this.nameTag);
		this.nameTag.destroy();
	}
}