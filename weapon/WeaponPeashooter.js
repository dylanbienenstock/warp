module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponPeashooter extends WeaponBase {
		constructor(ownerId) {
			super(ownerId);

			this.fireInterval = 400;
			this.damage = 6;
			this.shotSpeed = 32;
		}

		static getListing() {
			return {
				displayName: "Peashooter",
				className: "Peashooter",
				price: 0,
				description: "This is the default weapon...<br /><br />...don't buy it.",
				stats: {
					"Type": "Standard laser weapon",
					"Damage": 6,
					"Shots/min": 150,
					"Proj./shot": 1,
					"Shot speed": 32
				}
			};
		}

		fire(position, angle) {
			ENT.create(ENT.new("Laser", {
				ownerId: this.ownerId,
				damage: this.damage,
				thickness: 4,
				color: 0xFF0000,
				length: 32,
				x: position.x,
				y: position.y,
				angle: angle,
				speed: this.shotSpeed
			}));
		}
	}
}