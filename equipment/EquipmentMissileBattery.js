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
				description: "Contains 9 high-power homing missiles.\nNOTE: Not fully implemented.",
				texture: "equipment:missilebattery",
				stats: {
					"Type": "Homing missile weapon",
					"Damage": "30",
					"Quantity": "9",
					"Max allowed": "N/A"
				}
			};
		}

		beginUse(position, angle) {
			ENT.create(ENT.new("Missile", {
				ownerId: this.ownerId,
				damage: this.damage,
				radius: 6,
				color: 0xF541F5,
				x: position.x,
				y: position.y,
				angle: angle
			}));
		}
	}
}