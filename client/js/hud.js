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
var textPadding = 3;

function setupHUD(baseContainer) {
	var textStyle = new PIXI.TextStyle({
	    fontFamily: "Helvetica",
	    fontSize: 14,
	    fontWeight: "bold",
	    fill: "#000000",
	    letterSpacing: 0.25
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
		var destHealth = (ENT.localPlayer.alive ? ENT.localPlayer.health : 0);
		var destShield = (ENT.localPlayer.alive ? ENT.localPlayer.shieldPower : 0);

		health = lerp(health, destHealth, 0.1);
		shield = lerp(shield, destShield, 0.1);

		levels.beginFill(0x202020);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barHeight, barWidth, barHeight);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barPadding - barHeight * 2, barWidth, barHeight);
		levels.endFill();

		levels.beginFill(0xFFFFFF);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barHeight, health * (barWidth / barMaxValue), barHeight);
		levels.drawRect(windowPadding, windowHeight - windowPadding - barPadding - barHeight * 2, shield * (barWidth / barMaxValue), barHeight);
		levels.endFill();

		healthText.text = "health " + Math.floor(destHealth);
		shieldText.text = "shield " + Math.floor(destShield);

		healthText.x = windowPadding + textPadding;
		healthText.y = windowHeight - windowPadding - barHeight + 1;

		shieldText.x = windowPadding + textPadding;
		shieldText.y = windowHeight - windowPadding - barPadding - barHeight * 2 + 1;
	}
}