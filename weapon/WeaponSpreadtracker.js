module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponSpreadshot extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 1335;
			this.damage = 4;
			this.shotSpeed = 10;
			this.projectilesPerShot = 6;
			this.spreadAngleDegrees = 75;  
		}

		static getListing() {
			return {
				displayName: "Spreadtracker",
				className: "Spreadtracker",
				price: 0,
				description: "Fires a wide volley slow moving orbs of energy. Homes in on enemy if you have lock-on.",
				stats: {
					"Type": "Homing energy weapon",
					"Damage": 4,
					"Shots/min": 45,
					"Proj./shot": 6,
					"Shot speed": 10
				}
			};
		}

		fire(position, angle) {
			var spreadAngle = this.spreadAngleDegrees * Math.PI / 180;
			var spreadAngleIncrement = spreadAngle / this.projectilesPerShot;

			for (var i = 0; i < this.projectilesPerShot; i++) {
				var angle2 = angle - spreadAngle / 2 + spreadAngleIncrement / 2 + spreadAngleIncrement * i;

				ENT.create(ENT.new("Tracker", {
					ownerId: this.ownerId,
					damage: this.damage,
					radius: 5,
					color: 0x00FF00,
					x: position.x,
					y: position.y,
					angle: angle2,
					speed: this.shotSpeed,
					initialSpeedMult: 3 
				}));
			}
		}
	}
}