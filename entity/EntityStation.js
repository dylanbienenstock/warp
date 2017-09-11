module.exports = function(EntityBase, ENT, PHYS) {
	return class EntityStation extends EntityBase {
		constructor(data) {
			super(data);

			this.alignment = data.alignment || "neutral";
			this.color = data.color || 0x00FF00;
			this.x = data.x;
			this.y = data.y;
		}
	}
}