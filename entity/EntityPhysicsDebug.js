module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityPhysicsDebug extends EntityBase {
		constructor(data) {
			super(data);

			this.physicsObject = data.physicsObject;
			this.info = PHYS.getPhysicsInfo(this.physicsObject);
		}

		update() {
			this.info = PHYS.getPhysicsInfo(this.physicsObject);
		}

		network() {
			ENT.sendProperties(this, {
				info: this.info
			});
		}
	}
}