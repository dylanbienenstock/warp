module.exports = function(ENT, PHYS) {
	var WeaponBase = require("../weapon/WeaponBase.js")(ENT, PHYS);

	return {
		Peashooter: require("../weapon/WeaponPeashooter.js")(WeaponBase, ENT, PHYS),
		Spreadshot: require("../weapon/WeaponSpreadshot.js")(WeaponBase, ENT, PHYS),
		Sticky: require("../weapon/WeaponSticky.js")(WeaponBase, ENT, PHYS)
	};
}