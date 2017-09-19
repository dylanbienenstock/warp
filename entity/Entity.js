module.exports = function(io, ENT, PHYS) {
	var EntityBase = require("../entity/EntityBase.js")(ENT, PHYS);

	return {
		PhysicsDebug: require("../entity/EntityPhysicsDebug.js")(EntityBase, ENT, PHYS),
		Station: require("../entity/EntityStation.js")(EntityBase, ENT, PHYS),
		Planet: require("../entity/EntityPlanet.js")(EntityBase, ENT, PHYS),
		Asteroid: require("../entity/EntityAsteroid.js")(EntityBase, ENT, PHYS),
		Credits: require("../entity/EntityCredits.js")(EntityBase, ENT, PHYS),
		Player: require("../entity/EntityPlayer.js")(EntityBase, ENT, PHYS),
		Shield: require("../entity/EntityShield.js")(EntityBase, ENT, PHYS),
		Laser: require("../entity/EntityLaser.js")(EntityBase, ENT, PHYS),
		Tracker: require("../entity/EntityTracker.js")(EntityBase, ENT, PHYS),
		BouncerOrb: require("../entity/EntityBouncerOrb.js")(EntityBase, ENT, PHYS),
		BouncerAura: require("../entity/EntityBouncerAura.js")(EntityBase, ENT, PHYS),
		Beam: require("../entity/EntityBeam.js")(EntityBase, ENT, PHYS)
	};
}