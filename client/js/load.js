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

		.add("ship:cartel", "./img/ships/cartel/body.svg")
		.add("ship:cartel:outline", "./img/ships/cartel/outline.svg")
		.add("ship:cartel:shadow", "./img/ships/cartel/shadow.svg")
		.add("ship:cartel:forward", "./img/ships/cartel/forward.svg")
		.add("ship:cartel:backward","./img/ships/cartel/backward.svg")

		.add("shield", "./img/shield.svg")

		.add("station:outer:neutral", "./img/station/outer-neutral.svg")
		.add("station:inner:neutral", "./img/station/inner-neutral.svg")
		.add("station:outer:good", "./img/station/outer-good.svg")
		.add("station:inner:good", "./img/station/inner-good.svg")
		.add("station:outer:evil", "./img/station/outer-evil.svg")
		.add("station:inner:evil", "./img/station/inner-evil.svg")
		.add("station:inner:shadow", "./img/station/inner-shadow.svg")

		.add("planet:shadow", "./img/planet-shadow.svg")
		.add("planet:0:land", "./img/planets/0/land.png")
		.add("planet:0:clouds", "./img/planets/0/clouds.png")
		.add("planet:1:land", "./img/planets/1/land.png")
		.add("planet:1:clouds", "./img/planets/1/clouds.png")

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

// https://codepen.io/Izaias/pen/ZbbLOJ

WebFontConfig = {
	custom: {
		families: ["Source Code Pro"],
	},
	active: function() {
		createPIXIRenderer();
	}
};

(function() {
	var wf = document.createElement("script");
	wf.src = ("https:" == document.location.protocol ? "https" : "http") +
	"://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
	wf.type = "text/javascript";
	wf.async = "true";
	var s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(wf, s);
})();