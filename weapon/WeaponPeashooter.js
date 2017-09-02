module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponPeashooter extends WeaponBase {
		constructor(ownerId) {
			super(ownerId);

			this.fireInterval = 350;
		}

		static getListing() {
			return {
				displayName: "Peashooter",
				className: "Peashooter",
				price: 100,
				description: "It's a weapon."
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