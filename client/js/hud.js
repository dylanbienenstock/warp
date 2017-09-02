var levels;

var healthText;
var shieldText;
var boostText;
var creditsText;

var boost = 100;
var shield = 100;
var health = 100;
var barMaxValue = 100;
var barWidth = 300;
var barHeight = 20;
var barPadding = 5;
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

	var textStyle = new PIXI.TextStyle({
	    fontFamily: "Helvetica",
	    fontSize: 14,
	    fontWeight: "bold",
	    fill: "#000000",
	    letterSpacing: 0.25
	});

	var textStyle2 = new PIXI.TextStyle({
	    fontFamily: "Helvetica",
	    fontSize: 18,
	    fontWeight: "bold",
	    fill: "yellow",
	    letterSpacing: 0.25
	});

	levels = new PIXI.Graphics();
	healthText = new PIXI.Text("health 100", textStyle);
	shieldText = new PIXI.Text("shield 100", textStyle);
	boostText = new PIXI.Text("boost 100", textStyle);
	creditsText = new PIXI.Text("Credits: 0", textStyle2);

	HUDContainer.addChild(levels, healthText, shieldText, boostText, creditsText, radar);
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
	levels.clear();

	var windowWidth = $(window).innerWidth();
	var windowHeight = $(window).innerHeight();

	if (ENT.localPlayer != undefined) {
		var destHealth = (ENT.localPlayer.alive ? ENT.localPlayer.health : 0);
		var destShield = (ENT.localPlayer.alive ? ENT.localPlayer.shieldPower : 0);
		var destBoost = (ENT.localPlayer.alive ? ENT.localPlayer.boost : 0);

		health = lerp(health, destHealth, 0.1);
		shield = lerp(shield, destShield, 0.1);
		boost = lerp(boost, destBoost, 0.1);

		levels.beginFill(0x202020);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barHeight, barWidth, barHeight);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barPadding - barHeight * 2, barWidth, barHeight);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barPadding * 2 - barHeight * 3, barWidth, barHeight);
		levels.endFill();

		levels.beginFill(0xFFFFFF);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barHeight, health * (barWidth / barMaxValue), barHeight);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barPadding - barHeight * 2, shield * (barWidth / barMaxValue), barHeight);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barPadding * 2 - barHeight * 3, boost * (barWidth / barMaxValue), barHeight);
		levels.endFill();

		healthText.text = "health " + Math.floor(destHealth);
		shieldText.text = "shield " + Math.floor(destShield);
		boostText.text = "boost " + Math.floor(destBoost);
		creditsText.text = "Credits: " + formatCredits(Math.floor(ENT.localPlayer.credits), true);

		healthText.x = windowPadding + textPadding;
		healthText.y = windowHeight - windowPadding - barHeight + 1;

		shieldText.x = windowPadding + textPadding;
		shieldText.y = windowHeight - windowPadding - barPadding - barHeight * 2 + 1;

		boostText.x = windowPadding + textPadding;
		boostText.y = windowHeight - windowPadding - barPadding * 2 - barHeight * 3 + 1;

		creditsText.x = windowPadding + textPadding;
		creditsText.y = windowHeight - windowPadding - barPadding * 3 - barHeight * 4 + 1;
	}
}