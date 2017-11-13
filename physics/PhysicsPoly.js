var PHYS;

module.exports = function(PhysicsBase, __PHYS) {
	PHYS = __PHYS;

	return class PhysicsPoly extends PhysicsBase {
		constructor(data) {
			super(data);

			this.lines = data.lines;
		}
	}
}