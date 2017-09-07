class ShipCartel extends ShipBase {
	constructor(alive) {
		super(alive, {
			scale: 1.35,
			bodySprite: {
				texture: "ship:cartel",
				dimensions: {
					width: 32,
					height: 32
				},
				anchor: {
					x: 0.678,
					y: 0.5
				}
			},
			overlaySprite: "ship:cartel",
			outlineSprite: "ship:cartel:outline",
			shadowSprite: {
				texture: "ship:cartel:shadow",
				dimensions: {
					width: 40,
					height: 40
				}
			},
			forwardSprite: {
				texture: "ship:cartel:forward",
				dimensions: {
					width: 16,
					height: 32
				},
				anchor: {
					x: -0.6,
					y: 0.5
				}
			},
			backwardSprite: "ship:cartel:backward"
		});

		this.boostLocalX = 12;
		this.boostLocalY = 0;
	}
}