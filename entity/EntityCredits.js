module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityCredits extends EntityBase {
		constructor(data) {
			super(data);

			this.lifespan = 60 * 1000;

			this.amount = Math.floor(data.amount || 0);

			this.physicsObject = PHYS.new("Circle", {
				restrictToMap: true,
				x: this.x,
				y: this.y,
				radius: 14
			});
		}

		create() {
			PHYS.create(this, this.physicsObject);
		}

		update(timeMult) {
			super.update();
		}

		collideWith(entity, collision) {
			if (entity instanceof ENT.type("Player")) {
				entity.giveCredits(this.amount);
				ENT.trigger(this, "collect", entity.id);
				ENT.remove(this);
			}
		}

		network() {
			ENT.sendProperties(this, {
				x: this.physicsObject.x,
				y: this.physicsObject.y
			});
		}
	}
}