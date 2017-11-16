var ENT;
var PHYS;

class EntityBase {
	constructor(data) {
		this.id = -1;
		this.className = data.className;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.rotation = data.rotation || 0;
		this.alive = true;
	}

	create() {

	}

	remove() {
		if (this.physicsObject != undefined) {
			PHYS.remove(this.physicsObject);
		}
	}

	update() {
		if (this.physicsObject != undefined) {
			this.x = this.physicsObject.x;
			this.y = this.physicsObject.y;
			this.rotation = this.physicsObject.rotation;
		}
	}

	network() {

	}

	collideWith(entity, collision) {

	}

	// If override is true, we will take damage even if canTakeDamage is false
	// entity is the projectile, attackerId is the attacking player's id
	takeDamage(amount, entity, collision, override) {
		// Prevent self-damage
		var shouldTakeDamage = (entity.ownerId == undefined) || (this.id != entity.ownerId && this.ownerId != entity.ownerId);

		this.lastHealth = this.health;

		if (amount > 0 &&
			shouldTakeDamage &&
			(this.canTakeDamage || override) && 
			this.health != undefined &&
			this.alive) {

			amount = this.scaleDamage(amount) || amount;

			this.health = Math.max(this.health - amount, 0);

			if (this.health == 0) {
				this.alive = false;
				this.killed(amount, entity, collision, override);
			}
		}

		if (shouldTakeDamage && (this.canTakeDamage || override)) {
			entity.giveDamage(amount, entity, collision, override);

			return true;
		}

		return false;
	}

	scaleDamage(amount, entity, collision, override) {

	}

	giveDamage(amount, entity, collision, override) {

	}

	killed(amount, entity, collision, override) {

	}
}

module.exports = function(__ENT, __PHYS) {
	ENT = __ENT;
	PHYS = __PHYS;

	return EntityBase;
}