module.exports = function(io, ENT, PHYS) {
	var Base = require("../entity/EntityBase.js")(ENT, PHYS);

	return {
		PhysicsDebug: require("../entity/EntityPhysicsDebug.js")(Base, ENT, PHYS),
		Player: require("../entity/EntityPlayer.js")(Base, ENT, PHYS),
		Shield: require("../entity/EntityShield.js")(Base, ENT, PHYS),
		Laser: require("../entity/EntityLaser.js")(Base, ENT, PHYS)
	};
}