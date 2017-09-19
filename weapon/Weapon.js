module.exports = function(ENT, PHYS) {
	var WeaponBase = require("../weapon/WeaponBase.js")(ENT, PHYS);

	return {
		Peashooter: require("../weapon/WeaponPeashooter.js")(WeaponBase, ENT, PHYS),
		Spreadshot: require("../weapon/WeaponSpreadshot.js")(WeaponBase, ENT, PHYS),
		HeavyLaser: require("../weapon/WeaponHeavyLaser.js")(WeaponBase, ENT, PHYS),
		Tracker: require("../weapon/WeaponTracker.js")(WeaponBase, ENT, PHYS),
		Spreadtracker: require("../weapon/WeaponSpreadtracker.js")(WeaponBase, ENT, PHYS),
		ParticleBeam: require("../weapon/WeaponParticleBeam.js")(WeaponBase, ENT, PHYS)
	};
}