class ShipStealth extends ShipBase {
	constructor(alive) {
		super(alive, {
			scale: 1.5,
			bodySprite: {
				texture: "ship:stealth",
				dimensions: {
					width: 32,
					height: 32
				},
				anchor: {
					x: 0.5,
					y: 0.5
				}
			},
			overlaySprite: "ship:stealth",
			outlineSprite: "none",
			shadowSprite: {
				texture: "none",
				dimensions: {
					width: 40,
					height: 40
				}
			},
			forwardSprite: {
				texture: "ship:stealth:forward",
				dimensions: {
					width: 9,
					height: 16
				},
				anchor: {
					x: -1.7,
					y: 0.5
				}
			},
			backwardSprite: "none"
		});

		this.boostStartColor = [ 0.68, 0, 1 ];
		this.boostEndColor = [ 0.2, 0, 0.6 ];
		this.boostLocalX = 16;
		this.boostLocalY = 0;
		this.equipmentSlots = 4;
	}
}