module.exports = function(WeaponBase, ENT, PHYS) {
	return class SpecialWeaponBouncer extends WeaponBase {
		constructor(player) {
			super(player);

			this.fireInterval = 3000;
			this.damage = 15;
			this.shotSpeed = 16;

			this.aura = ENT.create(ENT.new("BouncerAura", {
				radius: 200,
				color: 0xFF00FF,
				ownerId: this.ownerId
			}));
		}

		static getListing() {
			return {
				displayName: "Bouncer",
				className: "Bouncer",
				price: 0,
				description: "Active: Fires a magnetic orb of energy that attracts enemies and drags them away from you<br />Passive: Repels nearby enemies",
				stats: {
					"Type": "Special weapon",
					"Damage": 0,
					"Active cooldown": "3s",
					"Proj./shot": 1,
					"Shot speed": 16
				}
			};
		}

		fire(position, angle) {
			ENT.create(ENT.new("BouncerOrb", {
				ownerId: this.ownerId,
				damage: this.damage,
				color: 0xFF00FF,
				radius: 36,
				x: position.x,
				y: position.y,
				angle: angle,
				speed: this.shotSpeed
			}));
		}

		remove() {
			ENT.remove(this.aura);
		}
	}
}