class ShipSkiff extends ShipBase {
	constructor(alive) {
		super(alive, {
			bodySprite: {
				texture: "ship:skiff",
				dimensions: {
					width: 32,
					height: 32
				},
				anchor: {
					x: 0.678,
					y: 0.5
				}
			},
			overlaySprite: "ship:skiff",
			outlineSprite: "ship:skiff:outline",
			shadowSprite: {
				texture: "ship:skiff:shadow",
				dimensions: {
					width: 40,
					height: 40
				}
			},
			forwardSprite: {
				texture: "ship:skiff:forward",
				dimensions: {
					width: 44,
					height: 32
				},
				anchor: {
					x: 0.475,
					y: 0.5
				}
			},
			backwardSprite: "ship:skiff:backward"
		});

		this.boostStartColor = [ 0, 0.85, 1 ];
		this.boostEndColor = [ 0, 0, 1 ];
		this.boostLocalX = 8;
		this.boostLocalY = 0;
		this.equipmentSlots = 3;
	}
}