var PHYS;

module.exports = function(PhysicsBase, __PHYS) {
	PHYS = __PHYS;

	return class PhysicsCircle extends PhysicsBase {
		constructor(data) {
			super(data);

			this.radius = data.radius || 16;
		}
	}
}