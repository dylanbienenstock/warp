var levels;
var healthText;
var shieldText;

var shield = 100;
var health = 100;
var barMaxValue = 100;
var barWidth = 300;
var barHeight = 20;
var barPadding = 5;
var windowPadding = 16;
var textPadding = 2;

function setupHUD(baseContainer) {
	var textStyle = new PIXI.TextStyle({
	    fontFamily: "Helvetica",
	    fontSize: 14,
	    fontWeight: "bold",
	    fill: "#000000",
	    stroke: "#FFFFFF",
	    strokeThickness: 2,
	    letterSpacing: 0.5
	});

	levels = new PIXI.Graphics();
	healthText = new PIXI.Text("health 100", textStyle);
	shieldText = new PIXI.Text("shield 100", textStyle);

	baseContainer.addChild(levels, healthText, shieldText);
}	

function drawHUD() {
	levels.clear();

	var windowWidth = $(window).innerWidth();
	var windowHeight = $(window).innerHeight();

	if (ENT.localPlayer != undefined) {
		health = lerp(health, ENT.localPlayer.health, 0.1);
		shield = lerp(shield, ENT.localPlayer.shieldPower, 0.1);

		levels.beginFill(0xFFFFFF);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barHeight, health * (barWidth / barMaxValue), barHeight);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barPadding - barHeight * 2, shield * (barWidth / barMaxValue), barHeight);
		levels.endFill();

		healthText.text = "health " + Math.round(ENT.localPlayer.health);
		shieldText.text = "shield " + Math.round(ENT.localPlayer.shieldPower);

		healthText.x = windowPadding + textPadding;
		healthText.y = windowHeight - windowPadding - barHeight;

		shieldText.x = windowPadding + textPadding;
		shieldText.y = windowHeight - windowPadding - barPadding - barHeight * 2;
	}
}