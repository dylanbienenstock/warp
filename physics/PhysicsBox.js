var PHYS;

module.exports = function(PhysicsBase, __PHYS) {
	PHYS = __PHYS;

	return class PhysicsObject extends PhysicsBase {
		constructor(data) {
			super(data);

			this.width = data.width || 16;
			this.height = data.height || 16;
			this.rotation = data.rotation || 0;
		}
	}
}