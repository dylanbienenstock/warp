var meterCredits;
var meterBoost;
var meterShield;
var meterHealth;
var metersVisible = false;

var windowPadding = 16;

var radar;
var radarDots = [];
var radarZones = [];
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

function addRadarDot(x, y, color, radius, trueRadius) {
	radarDots.push({
		x: x * radarProportion + radarX,
		y: y * radarProportion + radarY,
		color: color,
		radius: (trueRadius ? radius * radarProportion : radius)
	});
}

function addRadarZone(x, y, color, radius, trueRadius) {
	radarZones.push({
		x: x * radarProportion + radarX,
		y: y * radarProportion + radarY,
		color: color,
		radius: (trueRadius ? radius * radarProportion : radius)
	});
}

function drawRadar() {
	radar.clear();
	radar.lineStyle(2, 0xFFFFFF, 1);
	radar.beginFill(0x000000, 0.5);
	radar.drawCircle(radarX, radarY, radarRadius);
	radar.endFill();
	radar.lineStyle();

	radar.beginFill(0x00FF00, 0.25);
	radar.drawCircle(radarX, radarY, window.protectedSpaceRadius * radarProportion);
	radar.endFill();

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
	radar.beginFill(dot.color, (isZone ? 0.3 : 1));

	if (dot.radius > 1) {
		radar.drawCircle(Math.round(dot.x), Math.round(dot.y), dot.radius);
	} else if (dot.radius == 1) {
		radar.drawRect(Math.round(dot.x) - 1, Math.round(dot.y) - 1, 2, 2);
	} else {
		radar.drawRect(Math.round(dot.x), Math.round(dot.y), 1, 1);
	}

	radar.endFill();
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