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
				description: "Automatically deploys when your ship is destroyed.\nEjects in the direction you're facing.",
				texture: "equipment:escapepod",
				stats: {
					"Type": "Emergency escape pod",
					"Deploys when": "Destroyed",
					"Uses": "1",
					"Max allowed": "1"
				}
			};
		}
	}
}