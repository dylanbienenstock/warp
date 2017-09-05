module.exports = function(ENT, PHYS) {
	var WeaponBase = require("../weapon/WeaponBase.js")(ENT, PHYS);

	return {
		Bouncer: require("../weapon/SpecialWeaponBouncer.js")(WeaponBase, ENT, PHYS)
	};
}