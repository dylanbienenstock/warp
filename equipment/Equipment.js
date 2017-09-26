module.exports = function(ENT, PHYS) {
	var EquipmentBase = require("../equipment/EquipmentBase.js")(ENT, PHYS);

	return {
		MissileBattery: require("../equipment/EquipmentMissileBattery.js")(EquipmentBase, ENT, PHYS)
	};
}