module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponTracker extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 750;
			this.damage = 12;
			this.shotSpeed = 10;
		}

		static getListing() {
			return {
				displayName: "Tracker",
				className: "Tracker",
				price: 0,
				description: "Fires powerful slow moving orbs of energy. Homes in on enemy if you have lock-on.",
				stats: {
					"Type": "Homing energy weapon",
					"Damage": 12,
					"Shots/min": 120,
					"Proj./shot": 1,
					"Shot speed": 16
				}
			};
		}

		fire(position, angle) {
			ENT.create(ENT.new("Tracker", {
				ownerId: this.ownerId,
				damage: this.damage,
				radius: 6,
				color: 0xF541F5,
				x: position.x,
				y: position.y,
				angle: angle,
				speed: this.shotSpeed
			}));
		}
	}
}