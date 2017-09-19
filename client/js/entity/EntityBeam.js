class EntityBeam extends EntityBase {
	constructor(data) {
		super(data);
		this.ticks = 0;

		this.ownerId = data.ownerId;
		this.active = false;
		this.damage = data.damage || 2;
		this.color = data.color || 0xFF0000;
		this.range = data.range || 512;
		this.width = data.width || 32;

		this.container = new PIXI.Container();
		this.container.zIndex = 49;
		this.sprite = this.container;

		this.outerBeamGraphics = new PIXI.Graphics();
		this.outerBeamGraphics.x = this.x;
		this.outerBeamGraphics.y = this.y;
		this.outerBeamGraphics.alpha = 0.3;

		this.innerBeamGraphics = new PIXI.Graphics();
		this.innerBeamGraphics.x = this.x;
		this.innerBeamGraphics.y = this.y;
		this.innerBeamGraphics.alpha = 0.3;

		this.container.addChild(this.outerBeamGraphics, this.innerBeamGraphics);
		ENT.stageContainer.addChild(this.container);
	}

	update() {
		super.update(false);
		this.outerBeamGraphics.clear();
		this.innerBeamGraphics.clear();

		if (this.active) {
			var owner = ENT.getById(this.ownerId);

			if (owner != undefined) {
				var width = this.width;
				width += Math.random() * randomFloat(-6, 6);

				var outerBeamPolygon = new PIXI.Polygon(
					-this.range + width / 2, width / 2,
					-this.range + width / 2, -width / 2,
					0, -6,
					0, 6
				);

				var innerBeamPolygon = new PIXI.Polygon(
					-this.range + width / 2, width / 4,
					-this.range + width / 2, -width / 4,
					0, -3,
					0, 3
				);

				this.outerBeamGraphics.beginFill(this.color);
				this.outerBeamGraphics.drawPolygon(outerBeamPolygon);
				this.outerBeamGraphics.arc(-this.range + width / 2, 0, width / 2, -Math.PI - Math.PI / 2, -Math.PI * 2 - Math.PI / 2);
				this.outerBeamGraphics.endFill();

				this.innerBeamGraphics.beginFill(this.color);
				this.innerBeamGraphics.drawPolygon(innerBeamPolygon);
				this.innerBeamGraphics.arc(-this.range + width / 2, 0, width / 4, -Math.PI - Math.PI / 2, -Math.PI * 2 - Math.PI / 2);
				this.innerBeamGraphics.endFill();

				this.outerBeamGraphics.position = owner.ship.bodySprite.position;
				this.outerBeamGraphics.rotation = owner.sprite.rotation;
				this.innerBeamGraphics.position = this.outerBeamGraphics.position;
				this.innerBeamGraphics.rotation = this.outerBeamGraphics.rotation;

				this.outerBeamGraphics.alpha = 0.2 + Math.random() * 0.1;
				this.innerBeamGraphics.alpha = 0.3 + Math.random() * 0.1;
			}
		}
	}

	cull(visible) {
		this.container.visible = visible;
	}

	remove() {
		container.removeChildren();
		ENT.stageContainer.removeChild(this.container);
		this.container.destroy();
	}
}