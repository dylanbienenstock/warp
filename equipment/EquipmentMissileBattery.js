module.exports = function(EquipmentBase, ENT, PHYS) {
	return class EquipmentMissileBattery extends EquipmentBase {
		constructor(player) {
			super(player);

			this.uses = 9;
			this.useType = "single";
			this.useInterval = 500;
		}

		static getListing() {
			return {
				displayName: "Missile Battery",
				className: "MissileBattery",
				price: 0,
				description: "Contains 9 high-power homing missiles.",
				texture: "equipment:missilebattery",
				stats: {
					"Type": "Homing missile weapon",
					"Damage": 30,
					"Shots/min": 150,
					"Proj./shot": 1,
					"Shot speed": 32
				}
			};
		}

		use(position, angle) {
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