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
			this.boostFactor = 2.2;
			this.boostDeplete = 0.25;
			this.boostRegen = 0.8;
			this.equipmentSlots = 1;
		}

		static getListing() {
			return {
				displayName: "Escape Pod",
				className: "EscapePod",
				hidden: true
			};
		}
	}
}