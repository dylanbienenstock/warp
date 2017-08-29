module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPhysicsDebug extends EntityBase {
		constructor(data) {
			super(data);

			this.physicsObject = data.physicsObject;
		}

		network() {
			ENT.sendProperties(this, {
				info: this.physicsObject.info,
				sleeping: this.physicsObject.sleeping
			});
		}
	}
}