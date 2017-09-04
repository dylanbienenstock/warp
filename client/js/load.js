function loadContent(setup) {
	PIXI.loader
		.add("lockon", "./img/lockon.svg")
		.add("particle", "./img/particle.png")

		.add("projectile:orb", "./img/projectile/orb.svg")

		.add("ship:skiff", "./img/ships/skiff/body.svg")
		.add("ship:skiff:outline", "./img/ships/skiff/outline.svg")
		.add("ship:skiff:shadow", "./img/ships/skiff/shadow.svg")
		.add("ship:skiff:forward", "./img/ships/skiff/forward.svg")
		.add("ship:skiff:backward","./img/ships/skiff/backward.svg")

		.add("shield", "./img/shield.svg")

		.add("station:outer", "./img/station-outer.svg")
		.add("station:inner", "./img/station-inner.svg")
		.add("station:inner:shadow", "./img/station-inner-shadow.svg")

		.add("planet:shadow", "./img/planet-shadow.svg")

		.add("asteroid:0", "./img/asteroid/0.svg")
		.add("asteroid:1", "./img/asteroid/1.svg")
		.add("asteroid:2", "./img/asteroid/2.svg")
		.add("asteroid:3", "./img/asteroid/3.svg")
		.add("asteroid:0:outline", "./img/asteroid/0-outline.svg")
		.add("asteroid:1:outline", "./img/asteroid/1-outline.svg")
		.add("asteroid:2:outline", "./img/asteroid/2-outline.svg")
		.add("asteroid:3:outline", "./img/asteroid/3-outline.svg")
		.add("asteroid:0:overlay", "./img/asteroid/0-overlay.svg")
		.add("asteroid:1:overlay", "./img/asteroid/1-overlay.svg")
		.add("asteroid:2:overlay", "./img/asteroid/2-overlay.svg")
		.add("asteroid:3:overlay", "./img/asteroid/3-overlay.svg")
		
		.add("credits", "./img/credits.svg")
		.add("credits:glow", "./img/credits-glow.svg")
	.load(setup);
}