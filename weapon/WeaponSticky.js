module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponSticky extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 750;
			this.damage = 666;
			this.shotSpeed = 25;
		}

		static getListing() {
			return {
				displayName: "Sticky",
				className: "Sticky",
				price: 0,
				description: "This is the best weapon...<br /><br />...do buy it.",
				stats: {
					"Type": "Standard sticky weapon",
					"Damage": 666,
					"Shots/min": 666,
					"Proj./shot": 666,
					"Shot speed": 666
				}
			};
		}

		fire(position, angle) {
			ENT.create(ENT.new("Sticky", {
				ownerId: this.ownerId,
				x: position.x,
				y: position.y,
				radius: 9,
				angle: angle,
				speed: this.shotSpeed
			}));
		}
	}
}