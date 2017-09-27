module.exports = function(ShipBase, ENT, PHYS) {
	return class ShipEscapePod extends ShipBase {
		constructor(player) {
			super(player, [
				PHYS.new("Box", {
					restrictToMap: true,
					x: player.x,
					y: player.y,
					localX: -17,
					localY: -6,
					width: 34,
					height: 12
				})
			]);

			this.health = 100;
			this.speed = 8;
			this.shieldRadius = 32;
			this.shieldDamageFactor = 0.3;
			this.boostFactor = 1.8;
			this.boostDeplete = 0.5;
			this.boostRegen = 0.3;
			this.equipmentSlots = 1;
		}

		static getListing() {
			return {
				displayName: "Escape Pod",
				className: "EscapePod",
				price: 0,
				description: "This is the default ship.",
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