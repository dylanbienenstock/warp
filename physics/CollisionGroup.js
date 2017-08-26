// CollisionGroup undefined collides with all
// CollisionGroup "None" collides with nothing

module.exports = {
	Shield: [
		"Projectile"
	],

	Projectile: [
		"Shield"
	]
};