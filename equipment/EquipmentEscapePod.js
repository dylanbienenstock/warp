module.exports = function(EquipmentBase, ENT, PHYS) {
	return class EquipmentEscapePod extends EquipmentBase {
		constructor(player) {
			super(player);

			this.uses = 1;
			this.useType = "external";
		}

		static getListing() {
			return {
				displayName: "Escape Pod",
				className: "EscapePod",
				price: 0,
				description: "Automatically deploys when your ship is destroyed.",
				texture: "equipment:escapepod",
				stats: {
					"Type": "Emergency escape pod",
					"Deploys when": "Ship destroyed",
					"Uses": 1
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