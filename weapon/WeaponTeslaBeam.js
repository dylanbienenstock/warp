module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponTeslaBeam extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 100;
			this.damage = 2;
			this.range = 300;
			this.cone = 0.6;

			this.beam = ENT.create(ENT.new("TeslaBeam", {
				ownerId: this.ownerId,
				x: 0,
				y: 0,
				damage: this.damage,
				colors: [ 0x000000, 0xFF00FF, 0xD000FF, 0x8C00FF ],
				range: this.range,
				cone: this.cone
			}));
		}

		static getListing() {
			return {
				displayName: "Tesla Beam",
				className: "TeslaBeam",
				price: 0,
				description: "Fires an electrical beam that locks on to nearby objects. THIS IS WIP",
				stats: {
					"Type": "Homing beam weapon",
					"Damage": 2,
					"Shots/min": 300,
					"Proj./shot": 1,
					"Shot speed": 32
				}
			};
		}

		beginFire() {
			this.beam.active = true;
		}

		endFire() {
			this.beam.active = false;
		}

		fire(position, angle) {
			this.beam.findTargets(position, angle);
		}

		remove() {
			ENT.remove(this.beam);
		}
	}
}