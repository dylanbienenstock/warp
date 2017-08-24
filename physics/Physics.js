module.exports = function(PHYS) {
	var PhysicsBase = require("../physics/PhysicsBase.js")(PHYS);

	return {
		Box: require("../physics/PhysicsBox.js")(PhysicsBase, PHYS),
		Circle: require("../physics/PhysicsCircle.js")(PhysicsBase, PHYS)
	};
}