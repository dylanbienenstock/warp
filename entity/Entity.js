module.exports = function(io, ENT, PHYS) {
	var EntityBase = require("../entity/EntityBase.js")(ENT, PHYS);

	return {
		PhysicsDebug: require("../entity/EntityPhysicsDebug.js")(EntityBase, ENT, PHYS),
		Player: require("../entity/EntityPlayer.js")(EntityBase, ENT, PHYS),
		Shield: require("../entity/EntityShield.js")(EntityBase, ENT, PHYS),
		Laser: require("../entity/EntityLaser.js")(EntityBase, ENT, PHYS)
	};
}