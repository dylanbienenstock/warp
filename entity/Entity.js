module.exports = function(io, ENT, PHYS) {
	var Base = require("../entity/EntityBase.js")(ENT);

	return {
		PhysicsDebug: require("../entity/EntityPhysicsDebug.js")(Base, ENT, PHYS),
		Player: require("../entity/EntityPlayer.js")(Base, ENT, PHYS)
	};
}