class EntityPlayer extends EntityBase {
	constructor(data) {
		super(data);

		this.triggers.changeShip = this.onChangeShip.bind(this);
		this.triggers.hit = this.onHit.bind(this);
		this.triggers.death = this.onDeath.bind(this);
		this.triggers.boost = this.onBoost.bind(this);
		this.triggers.lockBroken = this.onLockBroken.bind(this);

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

		this.ship = new ShipSkiff(this.alive);
		this.sprite = this.ship.bodySprite;
		this.ship.controls = this.controls;

		this.shipListing = null;
		this.primaryWeaponListing = null;
		this.secondaryWeaponListing = null;

		this.createNameTag();
	}

	onChangeShip(className) {
		if (Ship.hasOwnProperty(className)) {
			this.ship.remove();
			this.ship = new Ship[className](this.alive);
		}
	}

	onHit() {
		this.ship.onHit();
	}

	onDeath() {
		this.health = 0;
		this.alive = false;
		this.ship.onDeath();
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
		this.ship.update();
	}

	receiveProperties(data) {
		if (this.isLocalPlayer) {
			delete data.controls;

			return data;
		}
	}

	cull(visible) {
		this.ship.container.visible = visible;
	}

	createNameTag() {
		this.nameTag = document.createElement("span");
		this.nameTag.className = "nametag";
		this.nameTag.innerHTML = this.name;

		document.body.appendChild(this.nameTag);

		this.updateNameTag();
	}

	updateNameTag() {
		var nameTagPosition = ENT.stageContainer.toGlobal(this.ship.bodySprite.position);
		var nameTagWidth = $(this.nameTag).outerWidth();
		var nameTagHeight = $(this.nameTag).outerHeight();

		nameTagPosition.x -= nameTagWidth / 2;
		nameTagPosition.y += 20 * window.currentZoom;

		nameTagPosition.x = Math.round(nameTagPosition.x);
		nameTagPosition.y = Math.round(nameTagPosition.y);

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
			x: this.ship.bodySprite.x + Math.cos(this.ship.bodySprite.rotation) * 11,
			y: this.ship.bodySprite.y + Math.sin(this.ship.bodySprite.rotation) * 11
		};
	}

	remove() {	
		this.sprite.destroy();
		this.ship.remove();
		document.body.removeChild(this.nameTag);
	}
}