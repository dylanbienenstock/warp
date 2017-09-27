class ShipEscapePod extends ShipBase {
	constructor(alive) {
		super(alive, {
			scale: 1,
			bodySprite: {
				texture: "ship:escapepod",
				dimensions: {
					width: 34,
					height: 16
				},
				anchor: {
					x: 0.5,
					y: 0.5
				}
			},
			overlaySprite: "ship:escapepod",
			outlineSprite: "ship:escapepod:outline",
			shadowSprite: {
				texture: "ship:escapepod:shadow",
				dimensions: {
					width: 40,
					height: 20
				}
			},
			forwardSprite: {
				texture: "ship:escapepod:forward"
			}
		});

		this.boostLocalX = 10;
		this.boostLocalY = 0;
		this.equipmentSlots = 1;
	}
}