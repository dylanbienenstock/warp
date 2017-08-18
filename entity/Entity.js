module.exports = function(io, ENT, PHYS) {
	var Base = require("../entity/EntityBase.js")(ENT);

	return {
		Player: require("../entity/EntityPlayer.js")(Base, ENT, PHYS)
	};
}