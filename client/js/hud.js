var creditsText;

var meterBoost;
var meterShield;
var meterHealth;
var metersVisible = false;

var textPadding = 3;
var windowPadding = 16;

var radar;
var radarDots = [];
var radarRadius = 100;
var radarProportion = radarRadius / window.boundaryRadius;
var radarX = windowPadding + radarRadius;
var radarY = windowPadding + radarRadius;

function setupHUD(HUDContainer) {
	radar = new PIXI.Graphics();

	creditsText = new PIXI.Text("Credits: 0", new PIXI.TextStyle({
	    fontFamily: "Helvetica",
	    fontSize: 18,
	    fontWeight: "bold",
	    fill: "yellow",
	    letterSpacing: 0.25
	}));

	HUDContainer.addChild(creditsText, radar);
}

function setupHUDMeters() {
	meterBoost = new HUDMeter({
		containerId: "meter-boost",
		iconURL: "./img/hud/boost.svg",
		color: "#40FF40",
		value: 100,
		maxValue: 100,
		segmentCount: 12
	});

	meterShield = new HUDMeter({
		containerId: "meter-shield",
		iconURL: "./img/hud/shield.svg",
		color: "#0088FF",
		value: 100,
		maxValue: 100,
		segmentCount: 12
	});

	meterHealth = new HUDMeter({
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
	drawLevels();
}

function addRadarDot(x, y, color, radius) {
	radarDots.push({
		x: x * radarProportion + radarX,
		y: y * radarProportion + radarY,
		color: color,
		radius: radius
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

	for (var i = radarDots.length - 1; i >= 0; i--) {
		var dot = radarDots[i];

		radar.beginFill(dot.color);
		radar.drawCircle(dot.x, dot.y, dot.radius);
		radar.endFill();

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

function drawLevels() {
	var windowWidth = $(window).innerWidth();
	var windowHeight = $(window).innerHeight();

	if (ENT.localPlayer != undefined && metersVisible) {
		meterBoost.setValue(ENT.localPlayer.alive ? ENT.localPlayer.boost : 0, 0.2);
		meterShield.setValue(ENT.localPlayer.alive ? ENT.localPlayer.shieldPower : 0, 0.2);
		meterHealth.setValue(ENT.localPlayer.alive ? ENT.localPlayer.health : 0, 0.2);
	}
}