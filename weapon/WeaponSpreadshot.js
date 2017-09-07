module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponSpreadshot extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 1200;
			this.damage = 10;
			this.shotSpeed = 32;
			this.projectilesPerShot = 4;
			this.spreadAngleDegrees = 30;  
		}

		static getListing() {
			return {
				displayName: "Spreadshot",
				className: "Spreadshot",
				price: 0,
				description: "Fires four moderately powerful lasers in a tight spread.",
				stats: {
					"Type": "Standard laser weapon",
					"Damage": 8,
					"Shots/min": 50,
					"Proj./shot": 4,
					"Shot speed": 32
				}
			};
		}

		fire(position, angle) {
			var spreadAngle = this.spreadAngleDegrees * Math.PI / 180;
			var spreadAngleIncrement = spreadAngle / this.projectilesPerShot;

			for (var i = 0; i < this.projectilesPerShot; i++) {
				var angle2 = angle - spreadAngle / 2 + spreadAngleIncrement / 2 + spreadAngleIncrement * i;

				ENT.create(ENT.new("Laser", {
					ownerId: this.ownerId,
					damage: this.damage,
					createParticles: i == 0,
					thickness: 4,
					color: 0x00FF00,
					length: 32,
					x: position.x,
					y: position.y,
					angle: angle2,
					speed: this.shotSpeed
				}));
			}
		}
	}
}