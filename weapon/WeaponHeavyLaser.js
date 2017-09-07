module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponHeavyLaser extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 445;
			this.damage = 15;
			this.shotSpeed = 40;
		}

		static getListing() {
			return {
				displayName: "Heavy Laser",
				className: "HeavyLaser",
				price: 0,
				description: "Fires a single high-powered laser.",
				stats: {
					"Type": "Standard laser weapon",
					"Damage": 15,
					"Shots/min": 135,
					"Proj./shot": 1,
					"Shot speed": 40
				}
			};
		}

		fire(position, angle) {
			ENT.create(ENT.new("Laser", {
				ownerId: this.ownerId,
				lifespan: 1250,
				damage: this.damage,
				thickness: 4,
				color: 0x0055FF,
				length: 32,
				x: position.x,
				y: position.y,
				angle: angle,
				speed: this.shotSpeed
			}));
		}
	}
}