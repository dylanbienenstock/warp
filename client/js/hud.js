var meterCredits;
var meterBoost;
var meterShield;
var meterHealth;
var metersVisible = false;

var windowPadding = 16;

var radar;
var radarDots = [];
var radarZones = [];
var radarRings = [];
var radarRadius = 100;
var radarProportion = radarRadius / window.boundaryRadius;
var radarX = windowPadding + radarRadius;
var radarY = windowPadding + radarRadius;

function setupHUD(HUDContainer) {
	radar = new PIXI.Graphics();

	HUDContainer.addChild(radar);
}

function setupHUDMeters() {
	meterCredits = new HUDMeter({
		type: "text",
		containerId: "meter-credits",
		iconURL: "./img/hud/credits.svg",
		color: "#FFD200",
		value: 0
	});

	meterBoost = new HUDMeter({
		type: "segmented",
		containerId: "meter-boost",
		iconURL: "./img/hud/boost.svg",
		color: "#40FF40",
		value: 100,
		maxValue: 100,
		segmentCount: 12
	});

	meterShield = new HUDMeter({
		type: "segmented",
		containerId: "meter-shield",
		iconURL: "./img/hud/shield.svg",
		color: "#0088FF",
		value: 100,
		maxValue: 100,
		segmentCount: 12
	});

	meterHealth = new HUDMeter({
		type: "segmented",
		containerId: "meter-health",
		iconURL: "./img/hud/health.svg",
		color: "#FF4040",
		value: 100,
		maxValue: 100,
		segmentCount: 12
	});

	metersVisible = true;
}

function drawHUD() {
	drawRadar();
	drawMeters();
}

function addRadarDot(x, y, color, radius, trueRadius, roundPosition) {
	if (roundPosition == undefined) {
		roundPosition = true;
	}

	radarDots.push({
		x: x * radarProportion + radarX,
		y: y * radarProportion + radarY,
		color: color,
		radius: (trueRadius ? radius * radarProportion : radius),
		roundPosition: roundPosition
	});
}

function addRadarZone(x, y, color, radius, trueRadius, roundPosition) {
	if (roundPosition == undefined) {
		roundPosition = true;
	}

	radarZones.push({
		x: x * radarProportion + radarX,
		y: y * radarProportion + radarY,
		color: color,
		radius: (trueRadius ? radius * radarProportion : radius),
		roundPosition: roundPosition
	});
}

function addRadarRing(x, y, color, radius, trueRadius, roundPosition) {
	if (roundPosition == undefined) {
		roundPosition = true;
	}

	radarRings.push({
		x: x * radarProportion + radarX,
		y: y * radarProportion + radarY,
		color: color,
		radius: (trueRadius ? radius * radarProportion : radius),
		roundPosition: roundPosition
	});
}

function drawRadar() {
	radar.clear();
	radar.lineStyle(2, 0xFFFFFF, 1);
	radar.beginFill(0x000000, 0.5);
	radar.drawCircle(radarX, radarY, radarRadius);
	radar.endFill();
	radar.lineStyle();

	for (var i = radarRings.length - 1; i >= 0; i--) {
		drawRadarRing(radarRings[i]);
		radarRings.splice(i, 1);
	}

	for (var i = radarZones.length - 1; i >= 0; i--) {
		drawRadarDot(radarZones[i], true);
		radarZones.splice(i, 1);
	}

	for (var i = radarDots.length - 1; i >= 0; i--) {
		drawRadarDot(radarDots[i]);
		radarDots.splice(i, 1);
	}

	if (ENT.physicsDebug && window.quadTreeData != null) {
		radar.lineStyle(1, 0xFF0000, 1);

		for (var i = window.quadTreeData.length - 1; i >= 0; i--) {
			var quadTree = window.quadTreeData[i];

			radar.drawRect(radarX + quadTree.x * radarProportion, radarY + quadTree.y * radarProportion,
						   quadTree.size * radarProportion, quadTree.size * radarProportion);
		}
	}
}

function drawRadarDot(dot, isZone) {
	radar.lineStyle();
	radar.beginFill(dot.color, (isZone ? 0.3 : 1));

	if (dot.roundPosition) {
		dot.x = Math.round(dot.x);
		dot.y = Math.round(dot.y);
	}

	if (dot.radius > 1) {
		radar.drawCircle(dot.x, dot.y, dot.radius);
	} else if (dot.radius == 1) {
		radar.drawRect(dot.x - 1, dot.y - 1, 2, 2);
	} else {
		radar.drawRect(dot.x, dot.y, 1, 1);
	}

	radar.endFill();
}

function drawRadarRing(ring) {
	if (ring.roundPosition) {
		ring.x = Math.round(ring.x);
		ring.y = Math.round(ring.y);
	}

	radar.lineStyle(1, ring.color);
	radar.drawCircle(ring.x, ring.y, ring.radius);
}

function drawMeters() {
	var windowWidth = $(window).innerWidth();
	var windowHeight = $(window).innerHeight();

	if (ENT.localPlayer != undefined && metersVisible) {
		meterCredits.setValue(ENT.localPlayer.credits, 0.2);
		meterBoost.setValue(ENT.localPlayer.alive ? ENT.localPlayer.boost : 0, 0.2);
		meterShield.setValue(ENT.localPlayer.alive ? ENT.localPlayer.shieldPower : 0, 0.2);
		meterHealth.setValue(ENT.localPlayer.alive ? ENT.localPlayer.health : 0, 0.2);
	}
}