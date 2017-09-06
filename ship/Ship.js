module.exports = function(ENT, PHYS) {
	var ShipBase = require("../ship/ShipBase.js")(ENT, PHYS);

	return {
		Skiff: require("../ship/ShipSkiff.js")(ShipBase, ENT, PHYS),
		Cartel: require("../ship/ShipCartel.js")(ShipBase, ENT, PHYS)
	};
}