module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponPeashooter extends WeaponBase {
		constructor(ownerId) {
			super(ownerId);

			this.name = "Peashooter";
			this.fireInterval = 350;
		}

		fire(position, angle) {
			ENT.create(ENT.new("Laser", {
				ownerId: this.ownerId,
				damage: 10,
				thickness: 4,
				color: 0xFF0000,
				length: 32,
				x: position.x,
				y: position.y,
				rotation: angle,
				thrustX: -Math.cos(angle) * 32,
				thrustY: -Math.sin(angle) * 32
			}));
		}
	}
}