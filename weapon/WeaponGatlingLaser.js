module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponGatlingLaser extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 200;
			this.damage = 5;
			this.shotSpeed = 50;
			this.gap = 12;
		}

		static getListing() {
			return {
				displayName: "Gatling Laser",
				className: "GatlingLaser",
				price: 0,
				description: "Fires two high-powered lasers rapidly.",
				stats: {
					"Type": "Standard laser weapon",
					"Damage": 5,
					"Shots/min": 300,
					"Proj./shot": 2,
					"Shot speed": 50
				}
			};
		}

		fire(position, angle) {
			ENT.create(ENT.new("Laser", {
				ownerId: this.ownerId,
				lifespan: 1100,
				damage: this.damage,
				thickness: 4,
				color: 0xC60CFF,
				length: 52,
				x: position.x + Math.cos(angle + 90 * Math.PI / 180) * (this.gap / 2),
				y: position.y + Math.sin(angle + 90 * Math.PI / 180) * (this.gap / 2),
				angle: angle,
				speed: this.shotSpeed
			}));

			ENT.create(ENT.new("Laser", {
				ownerId: this.ownerId,
				lifespan: 1100,
				damage: this.damage,
				thickness: 4,
				color: 0xC60CFF,
				length: 52,
				x: position.x - Math.cos(angle + 90 * Math.PI / 180) * (this.gap / 2),
				y: position.y - Math.sin(angle + 90 * Math.PI / 180) * (this.gap / 2),
				angle: angle,
				speed: this.shotSpeed
			}));
		}
	}
}