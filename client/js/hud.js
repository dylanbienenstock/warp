var windowPadding = 16;

var meterCredits;
var meterBoost;
var meterShield;
var meterHealth;
var metersVisible = false;

var radar;
var radarMask;
var radarDots = [];
var radarZones = [];
var radarRings = [];
var radarInitialRadius = 100;
var radarRadius = radarInitialRadius;
var radarProportion = radarRadius / window.boundaryRadius;
var radarInitialScale = 1;
var radarDestScale = radarInitialScale;
var radarScale = radarInitialScale;
var radarInitialX = windowPadding + radarRadius;
var radarInitialY = windowPadding + radarRadius;
var radarDestX = radarInitialX;
var radarDestY = radarInitialX;
var radarX = radarInitialX;
var radarY = radarInitialX;
var radarInitialAlpha = 0.5;
var radarDestAlpha = radarInitialAlpha;
var radarAlpha = radarInitialAlpha;
var radarWarpCircleRadius = 13;
var radarLerpFactor = 1;

window.aboutToWarp = false;
window.warping = false;

function setupHUD(HUDContainer) {
	radar = new PIXI.Graphics();
	radarMask = new PIXI.Graphics();
	radar.mask = radarMask;

	HUDContainer.addChild(radar, radarMask);
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
		radius: (trueRadius ? radius * radarProportion : radius * radarScale),
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
		radius: (trueRadius ? radius * radarProportion : radius * radarScale),
		roundPosition: roundPosition
	});
}

function addRadarRing(x, y, color, radius, width, trueDimensions, roundPosition) {
	if (roundPosition == undefined) {
		roundPosition = true;
	}

	radarRings.push({
		x: x * radarProportion + radarX,
		y: y * radarProportion + radarY,
		color: color,
		radius: (trueDimensions ? radius * radarProportion : radius * radarScale),
		width: (trueDimensions ? width * radarProportion : width),
		roundPosition: roundPosition
	});
}

function drawRadar() {
	var radarIsFullSize = false;

	if (window.aboutToWarp) {
		var fullSize = (ENT.wh / 2 - 64) / radarInitialRadius;

		radarDestScale = fullSize;
		radarDestX = Math.round(ENT.ww / 2);
		radarDestY = Math.round(ENT.wh / 2);
		radarDestAlpha = 1;

		radarFullSize = radarDestScale == fullSize;
	} else {
		radarDestScale = radarInitialScale;
		radarDestX = radarInitialX;
		radarDestY = radarInitialY;
		radarDestAlpha = radarInitialScale;
	}

	radarScale = lerp(radarScale, radarDestScale, radarLerpFactor);
	radarRadius = radarInitialRadius * radarScale;
	radarProportion = radarRadius / window.boundaryRadius;
	radarX = lerp(radarX, radarDestX, radarLerpFactor);
	radarY = lerp(radarY, radarDestY, radarLerpFactor);
	radarAlpha = lerp(radarAlpha, radarDestAlpha, radarLerpFactor);

	radarMask.clear();
	radarMask.beginFill(0xFFFFFF);
	radarMask.drawCircle(radarX, radarY, radarRadius);
	radarMask.endFill();

	radar.clear();
	radar.beginFill(0x000000, radarAlpha);
	radar.drawCircle(radarX, radarY, radarRadius);
	radar.endFill();

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

	if (window.aboutToWarp && radarFullSize) {
		drawWarpPath();
	} else {
		document.body.style.cursor = "auto";
	}

	radar.lineStyle(2, 0xFFFFFF);
	radar.drawCircle(radarX, radarY, radarRadius - 1);
}

function drawWarpPath() {
	var localPlayerX = Math.round(ENT.localPlayer.sprite.x * radarProportion + radarX);
	var localPlayerY = Math.round(ENT.localPlayer.sprite.y * radarProportion + radarY);
	var distanceFromCenter = Math.sqrt(Math.pow(ENT.ww / 2 - window.mouseX, 2) + Math.pow(ENT.wh / 2 - window.mouseY, 2));
	var distanceFromPlayer = Math.sqrt(Math.pow(localPlayerX - window.mouseX, 2) + Math.pow(localPlayerY - window.mouseY, 2));
	var angle = Math.atan2(window.mouseY - localPlayerY, window.mouseX - localPlayerX);
	var minWarpDistance = ENT.localPlayer.minWarpDistance * radarProportion;
	var maxWarpDistance = ENT.localPlayer.maxWarpDistance * radarProportion;
	var warpWidth = maxWarpDistance - minWarpDistance;
	var cursorColor = 0xF44242;

	radar.lineStyle(warpWidth, 0x42E8F8, 0.3);
	radar.drawCircle(localPlayerX, localPlayerY, minWarpDistance + warpWidth / 2);

	if (distanceFromPlayer > minWarpDistance &&
		distanceFromPlayer < maxWarpDistance &&
		distanceFromCenter < radarRadius) {

		cursorColor = 0x42E8F8;
		document.body.style.cursor = "pointer";
	} else {
		document.body.style.cursor = "auto";
	}

	radar.lineStyle(2, cursorColor, (radarAlpha - radarInitialAlpha) * (1 / radarInitialAlpha));
	radar.drawCircle(localPlayerX, localPlayerY, radarWarpCircleRadius);

	if (distanceFromPlayer > minWarpDistance && distanceFromCenter < radarRadius) {
		ENT.localPlayer.sprite.rotation = Math.atan2(localPlayerY - window.mouseY, localPlayerX - window.mouseX);

		radar.beginFill(cursorColor, 0.5);
		radar.drawCircle(window.mouseX, window.mouseY, radarWarpCircleRadius);
		radar.endFill();

		var lineStartX = localPlayerX + Math.cos(angle) * radarWarpCircleRadius;
		var lineStartY = localPlayerY + Math.sin(angle) * radarWarpCircleRadius;
		var lineEndX = window.mouseX - Math.cos(angle) * radarWarpCircleRadius;
		var lineEndY = window.mouseY - Math.sin(angle) * radarWarpCircleRadius;

		radar.moveTo(lineStartX, lineStartY);
		radar.lineTo(lineEndX, lineEndY);

		lineStartX = lineEndX;
		lineStartY = lineEndY;
		lineEndX = window.mouseX - Math.cos(angle - 0.25) * radarWarpCircleRadius * 2;
		lineEndY = window.mouseY - Math.sin(angle - 0.25) * radarWarpCircleRadius * 2;

		radar.moveTo(lineStartX, lineStartY);
		radar.lineTo(lineEndX, lineEndY);

		lineEndX = window.mouseX - Math.cos(angle + 0.25) * radarWarpCircleRadius * 2;
		lineEndY = window.mouseY - Math.sin(angle + 0.25) * radarWarpCircleRadius * 2;

		radar.moveTo(lineStartX, lineStartY);
		radar.lineTo(lineEndX, lineEndY);
	}
}

function getWarpPosition() {
	var localPlayerX = Math.round(ENT.localPlayer.sprite.x * radarProportion + radarX);
	var localPlayerY = Math.round(ENT.localPlayer.sprite.y * radarProportion + radarY);
	var distanceFromCenter = Math.sqrt(Math.pow(ENT.ww / 2 - window.mouseX, 2) + Math.pow(ENT.wh / 2 - window.mouseY, 2));
	var distanceFromPlayer = Math.sqrt(Math.pow(localPlayerX - window.mouseX, 2) + Math.pow(localPlayerY - window.mouseY, 2));
	var minWarpDistance = ENT.localPlayer.minWarpDistance * radarProportion;
	var maxWarpDistance = ENT.localPlayer.maxWarpDistance * radarProportion;

	if (distanceFromPlayer > minWarpDistance && 
		distanceFromPlayer < maxWarpDistance && 
		distanceFromCenter < radarRadius) {

		return {
			x: (window.mouseX - ENT.ww / 2) / radarProportion,
			y: (window.mouseY - ENT.wh / 2) / radarProportion
		};
	}

	return null;
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

	radar.lineStyle(ring.width, ring.color);
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