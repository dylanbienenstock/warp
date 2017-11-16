module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityTeslaBeam extends EntityBase {
		constructor(data) {
			super(data);

			this.ownerId = data.ownerId;
			this.active = false;
			this.targetIds = [];
			this.damage = data.damage || 2;
			this.colors = data.colors || [ 0xFF0000 ];
			this.range = data.range || 300;
			this.cone = data.cone || 0.6;
		}

		create() {

		}

		findTargets(position, angle) {
			this.targetIds = ENT.getInCone(position.x, position.y, angle, this.range, 0.6)

			.filter(function(entity) {
				return entity.canTakeDamage &&
					   entity.id != this.ownerId &&
					   entity.ownerId != this.ownerId;
			}.bind(this))

			.map(function(entity) {
				return entity.id;
			});
		}

		network() {
			ENT.sendProperties(this, {
				active: this.active,
				targetIds: this.targetIds
			});
		}
	}
}