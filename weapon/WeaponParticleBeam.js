module.exports = function(WeaponBase, ENT, PHYS) {
	return class WeaponParticleBeam extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 50;
			this.damage = 2;
			this.range = 512;
			this.width = 32;

			this.beam = ENT.create(ENT.new("Beam", {
				ownerId: this.ownerId,
				x: 0,
				y: 0,
				damage: this.damage,
				color: 0xFF0000,
				range: this.range,
				width: this.width
			}));
		}

		static getListing() {
			return {
				hidden: true,
				displayName: "Particle Beam",
				className: "ParticleBeam",
				price: 0,
				description: "Fires a constant particle beam.",
				stats: {
					"Type": "Standard beam weapon",
					"Damage": 2,
					"Shots/min": 300,
					"Range": 512,
					"Shot speed": "Instant"
				}
			};
		}

		beginFire() {
			this.beam.active = true;
			this.beam.physicsObject.active = true;
		}

		endFire() {
			this.beam.active = false;
			this.beam.physicsObject.active = false;
		}

		fire(position, angle) {
			var owner = ENT.getById(this.ownerId);

			if (owner != undefined) {
				this.beam.physicsObject.x = position.x;
				this.beam.physicsObject.y = position.y;
				this.beam.physicsObject.rotation = angle;
			}
		}

		remove() {
			ENT.remove(this.beam);
		}
	}
}