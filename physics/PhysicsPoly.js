var PHYS;

module.exports = function(PhysicsBase, __PHYS) {
	PHYS = __PHYS;

	return class PhysicsPoly extends PhysicsBase {
		constructor(data) {
			super(data);

			this.rotation = data.rotation || 0;
			this.lines = data.lines || [];
		}
	}
}