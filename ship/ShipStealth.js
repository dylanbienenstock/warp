module.exports = function(ShipBase, ENT, PHYS) {
	return class ShipStealth extends ShipBase {
		constructor(player) {
			super(player, [
				PHYS.new("Box", {
					restrictToMap: true,
					x: player.x,
					y: player.y,
					localX: -6,
					localY: -16,
					width: 16,
					height: 32
				}),

				PHYS.new("Box", {
					localX: -22,
					localY: -5,
					width: 16,
					height: 10
				})
			]);

			this.health = 100;
			this.speed = 7.5;
			this.shieldRadius = 32;
			this.shieldDamageFactor = 0.5;
			this.boostFactor = 2;
			this.boostDeplete = 0.3;
			this.boostRegen = 0.22;
			this.equipmentSlots = 4;
		}

		static getListing() {
			return {
				displayName: "Stealth",
				className: "Stealth",
				price: 0,
				description: "This is the NEW ship.",
				stats: {
					"Type": "Standard fighter",
					"Health": "100",
					"Shield factor": "2",
					"Speed": "6",
					"Boost factor": "1.8"
				}
			};
		}
	}
}