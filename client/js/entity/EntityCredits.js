var creditsRadius = 14;

class EntityCredits extends EntityBase {
	constructor(data) {
		super(data);

		this.triggers.collect = this.onCollect.bind(this);

		this.amount = data.amount || 0;

		this.glowSprite = new PIXI.Sprite(PIXI.loader.resources["credits:glow"].texture);
		this.glowSprite.anchor.set(0.5, 0.5);
		this.glowSprite.width = creditsRadius * 4;
		this.glowSprite.height = creditsRadius * 4;
		this.glowSprite.x = this.x;
		this.glowSprite.y = this.y;
		this.glowSprite.zIndex = 1;

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["credits"].texture);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = creditsRadius * 2;
		this.sprite.height = creditsRadius * 2;
		this.sprite.x = this.x;
		this.sprite.y = this.y;
		this.sprite.zIndex = 2;

		ENT.stageContainer.addChild(this.glowSprite, this.sprite);
	}

	onCollect(playerId) {
		if (playerId == ENT.localPlayer.id) {
			var ww = $(window).innerWidth();
			var wh = $(window).innerHeight();

			var collectText = document.createElement("span");
			collectText.className = "collect-credits";
			collectText.innerHTML = "+" + formatCredits(this.amount) + " credits";

			document.body.appendChild(collectText);

			$(collectText).offset({
				top: wh / 2 - $(collectText).outerHeight() / 2 - 16,
				left: ww / 2 - $(collectText).outerWidth() / 2
			});

			$(collectText).animate({
				top: "-=64",
				opacity: 0
			}, 750, function() {
				document.body.removeChild(collectText);
			});
		}
	}

	update() {
		super.update();

		this.sprite.attach(this.glowSprite);
	}

	cull(visible) {
		this.sprite.visible = visible;
	}

	remove() {
		ENT.stageContainer.removeChild(this.glowSprite, this.sprite);
	}
}