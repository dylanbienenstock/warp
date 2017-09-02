module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponSpreadshot extends WeaponBase {
		constructor(ownerId) {
			super(ownerId);

			this.fireInterval = 1250;
		}

		static getListing() {
			return {
				displayName: "Spreadshot",
				className: "Spreadshot",
				price: 2500,
				description: "It's the second weapon."
			};
		}

		fire(position, angle) {
			ENT.create(ENT.new("Laser", {
				ownerId: this.ownerId,
				damage: 10,
				thickness: 4,
				color: 0xFF0000,
				length: 32,
				x: position.x,
				y: position.y,
				angle: angle,
				force: 32
			}));
		}
	}
}