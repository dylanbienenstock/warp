module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponSpreadshot extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 1200;
			this.damage = 6;
			this.shotSpeed = 32;
			this.projectilesPerShot = 4;
			this.spreadAngleDegrees = 30;  
		}

		static getListing() {
			return {
				displayName: "Spreadshot",
				className: "Spreadshot",
				price: 2500,
				description: "It's the second weapon.",
				stats: {
					"Type": "Standard laser weapon",
					"Damage": 6,
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
				ENT.create(ENT.new("Laser", {
					ownerId: this.ownerId,
					damage: this.damage,
					thickness: 4,
					color: 0x00FF00,
					length: 32,
					x: position.x,
					y: position.y,
					angle: angle - spreadAngle / 2 + spreadAngleIncrement / 2 + spreadAngleIncrement * i,
					speed: this.shotSpeed
				}));
			}
		}
	}
}