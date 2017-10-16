var windowPadding = 16;

var meterCredits;
var meterBoost;
var meterWarp;
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
window.equipmentSlots = 3;
window.equipmentDirty = true;
window.mouseOverEquipment = false;

var equipmentContainer;
var equipmentTextContainer;
var equipmentGraphics;
//var equipmentTextGraphics;
var equipmentBoxTexture;
var equipmentBoxSize = 104;
var equimentTextBoxSize = 20;
var equipmentBoxes = [];
var equipmentListingSprites = [];
var equipmentLastHoveringIndex;
var equipmentHoveringIndex;
var equipmentDraggingIndex;
var equipmentDragging = false;
var equipmentDragOffsetX;
var equipmentDragOffsetY;
var equipmentDragGraphics;
var equipmentDraggedToDifferentSlot;
var equipmentCirclePadding = 4;
var equipmentCircleRadius = 5;

function setupHUD(HUDContainer) {
	radar = new PIXI.Graphics();
	radarMask = new PIXI.Graphics();
	radar.mask = radarMask;

	equipmentContainer = new PIXI.ParticleContainer();
	equipmentTextContainer = new PIXI.Container();
	equipmentGraphics = new PIXI.Graphics();
	equipmentDragGraphics = new PIXI.Graphics();
	//equipmentTextGraphics = new PIXI.Graphics();

	//equipmentTextContainer.addChild(equipmentTextGraphics);
	HUDContainer.addChild(radar, radarMask, equipmentContainer, equipmentTextContainer, equipmentDragGraphics);
}

function setupHUDMeters() {
	meterCredits = new HUDMeter({
		type: "text",
		containerId: "meter-credits",
		iconURL: "./img/hud/credits.svg",
		color: "#FFD200"
	});

	meterBoost = new HUDMeter({
		type: "segmented",
		containerId: "meter-boost",
		iconURL: "./img/hud/boost.svg",
		color: "#40FF40",
		maxValue: 100,
		segmentCount: 12
	});

	meterWarp = new HUDMeter({
		type: "segmented",
		containerId: "meter-warp",
		iconURL: "./img/hud/warp.svg",
		color: "#42E8F8",
		maxValue: 100,
		segmentCount: 12
	});

	meterWarp.onLoad = function() {
		window.equipmentDirty = true;
	};

	meterShield = new HUDMeter({
		type: "segmented",
		containerId: "meter-shield",
		iconURL: "./img/hud/shield.svg",
		color: "#b400ff",
		maxValue: 100,
		segmentCount: 12
	});

	meterHealth = new HUDMeter({
		type: "segmented",
		containerId: "meter-health",
		iconURL: "./img/hud/health.svg",
		color: "#FF4040",
		maxValue: 100,
		segmentCount: 12
	});

	metersVisible = true;
}

function drawHUD() {
	drawRadar();
	drawMeters();
	drawEquipment();
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
	var maxWarpDistance = (ENT.localPlayer.minWarpDistance + ENT.localPlayer.warpPower) * radarProportion;
	var warpWidth = maxWarpDistance - minWarpDistance;
	var cursorColor = 0xF44242;

	radar.lineStyle(warpWidth, 0x42E8F8, 0.3);
	radar.drawCircle(localPlayerX, localPlayerY, minWarpDistance + warpWidth / 2);

	if (distanceFromPlayer > minWarpDistance &&
		distanceFromPlayer < maxWarpDistance &&
		distanceFromCenter < radarRadius) {

		cursorColor = 0x42E8F8;
		document.body.style.cursor = "pointer";
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
	var maxWarpDistance = (ENT.localPlayer.minWarpDistance + ENT.localPlayer.warpPower) * radarProportion;

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
		meterCredits.setValue(ENT.localPlayer.credits, 1);
		meterBoost.setValue(ENT.localPlayer.alive ? ENT.localPlayer.boost : 0, 0.2);
		meterWarp.maxValue = ENT.localPlayer.maxWarpDistance - ENT.localPlayer.minWarpDistance;
		meterWarp.setValue(ENT.localPlayer.alive ? ENT.localPlayer.warpPower : 0, 0.2);
		meterShield.setValue(ENT.localPlayer.alive ? ENT.localPlayer.shieldPower : 0, 0.2);
		meterHealth.setValue(ENT.localPlayer.alive ? ENT.localPlayer.health : 0, 0.2);
	}
}

function drawEquipment() {
	equipmentLastHoveringIndex = equipmentHoveringIndex;

	if (window.equipmentDirty) {
		window.equipmentDirty = false;
		drawEquipmentBoxes();
	}

	if (window.aboutToWarp) {
		equipmentContainer.visible = false;
	} else {
		window.mouseOverEquipment = false;
		equipmentContainer.visible = true;
		equipmentHoveringIndex = null;

		for (var i = 0; i < equipmentBoxes.length; i++) {
			var equipmentBox = equipmentBoxes[i];
			equipmentBox.alpha = 0.7;
			equipmentBox.mouseIsOver = false;

			if (!window.mouseOverEquipment &&
				window.mouseX >= equipmentBox.x &&
				window.mouseX < equipmentBox.x + equipmentBoxSize + 4 &&
				window.mouseY >= equipmentBox.y &&
				window.mouseY < equipmentBox.y + equipmentBoxSize) {

				document.body.style.cursor = "move";
				equipmentBox.alpha = 1;
				equipmentBox.mouseIsOver = true;
				window.mouseOverEquipment = true;

				equipmentHoveringIndex = i;
			}
		}

		if (equipmentHoveringIndex != equipmentLastHoveringIndex) {
			equipmentDraggedToDifferentSlot = true;
			dragEquipment();
		}
	}

	equipmentContainer.children.sort(function(a, b) {
		if (b.isBox) return 1;
		if (a.isBox) return -1;

		return 0;
	}); 
}

function beginDragEquipment() { // Called on mousedown
	if (equipmentHoveringIndex != null) {
		var draggingSprite = equipmentListingSprites[equipmentHoveringIndex];

		if (draggingSprite != null) {
			draggingSprite.alpha = 0.5;

			equipmentDraggingIndex = equipmentHoveringIndex;
			equipmentDragging = true;
			equipmentDragOffsetX = window.mouseX - draggingSprite.x;
			equipmentDragOffsetY = window.mouseY - draggingSprite.y;
		}
	}
}

function resetLastHoveringSprite() {
	if (equipmentLastHoveringIndex != equipmentDraggingIndex) {
		var lastHoveringSprite = equipmentListingSprites[equipmentLastHoveringIndex];

		if (lastHoveringSprite != null) {
			lastHoveringSprite.alpha = 1;
			lastHoveringSprite.position = equipmentBoxes[equipmentLastHoveringIndex].position;
			lastHoveringSprite.x += equipmentBoxSize / 2;
			lastHoveringSprite.y += equipmentBoxSize / 2;
		}
	}
}

function dragEquipment() { // Called on mousemove
	if (equipmentDraggingIndex != null) {
		var draggingSprite = equipmentListingSprites[equipmentDraggingIndex];

		if (draggingSprite != null) {
			if (equipmentHoveringIndex == null) { // Dragged out of equipment bar
				equipmentDragGraphics.clear();
				resetLastHoveringSprite();

				draggingSprite.x = window.mouseX;
				draggingSprite.y = window.mouseY;
			}
			else if (equipmentDraggedToDifferentSlot) { // Dragged into another slot
				equipmentDraggedToDifferentSlot = false;
				drawEquipmentDrag();
				resetLastHoveringSprite();

				var hoveringSprite = equipmentListingSprites[equipmentHoveringIndex];

				if (hoveringSprite != null) {
					hoveringSprite.alpha = 0.5;
					hoveringSprite.position = equipmentBoxes[equipmentDraggingIndex].position;
					hoveringSprite.x += equipmentBoxSize / 2;
					hoveringSprite.y += equipmentBoxSize / 2;
				}

				draggingSprite.position = equipmentBoxes[equipmentHoveringIndex].position;
				draggingSprite.x += equipmentBoxSize / 2;
				draggingSprite.y += equipmentBoxSize / 2;
			}
		}
	}
}

function drawEquipmentDrag() {
	equipmentDragGraphics.clear();

	if (equipmentHoveringIndex != equipmentDraggingIndex) {
		var hoveringBox = equipmentBoxes[equipmentHoveringIndex];
		var draggingBox = equipmentBoxes[equipmentDraggingIndex];

		var controlPointOffsetY = 32 + (Math.abs(equipmentHoveringIndex - equipmentDraggingIndex) - 1) * 8;
		var startX = hoveringBox.x + equipmentBoxSize / 2;
		var startY = hoveringBox.y - equipmentCirclePadding - equipmentCircleRadius * 2;
		var endX = draggingBox.x + equipmentBoxSize / 2;
		var endY = draggingBox.y - equipmentCirclePadding - equipmentCircleRadius * 2;

		equipmentDragGraphics.lineStyle(3, 0x353535);
		equipmentDragGraphics.moveTo(startX, startY + 1);
		equipmentDragGraphics.bezierCurveTo(startX, startY - controlPointOffsetY, endX, endY - controlPointOffsetY, endX, endY + 1);
		equipmentDragGraphics.lineStyle();

		equipmentDragGraphics.beginFill(0x353535);
		equipmentDragGraphics.drawCircle(startX, startY + equipmentCircleRadius, equipmentCircleRadius);
		equipmentDragGraphics.drawCircle(endX, endY + equipmentCircleRadius, equipmentCircleRadius);
		equipmentDragGraphics.endFill();
	}
}

function dropEquipment() { // Called on mouseup
	if (!equipmentDragging) return;
	equipmentDragGraphics.clear();

	if (equipmentHoveringIndex != null && equipmentHoveringIndex != equipmentDraggingIndex) {
		swapEquipment(equipmentDraggingIndex, equipmentHoveringIndex);
	}

	equipmentDraggingIndex = null;
	equipmentDragging = false;
	window.equipmentDirty = true;
}

function swapEquipment(a, b) {
	var storedListing = ENT.localPlayer.equipmentListings[a];
	ENT.localPlayer.equipmentListings[a] = ENT.localPlayer.equipmentListings[b];
	ENT.localPlayer.equipmentListings[b] = storedListing;

	sendSwapEquipment(a, b);
}

function drawEquipmentBoxes() {
	if (ENT.localPlayer == undefined) return;

	equipmentBoxes.length = 0;
	equipmentListingSprites.length = 0;
	equipmentContainer.removeChildren();
	equipmentTextContainer.removeChildren();
	//equipmentTextContainer.addChild(equipmentTextGraphics);

	if (equipmentBoxTexture != null) {
		equipmentBoxTexture.destroy();
		equipmentBoxTexture = null;
	}

	equipmentGraphics.clear();
	equipmentGraphics.beginFill(0x303030, 1);
	equipmentGraphics.drawRoundedRect(0, 0, equipmentBoxSize, equipmentBoxSize, 4);
	equipmentGraphics.endFill();
	equipmentGraphics.bounds = new PIXI.Rectangle(0, 0, equipmentBoxSize, equipmentBoxSize);

	equipmentBoxTexture = window.renderer.generateTexture(equipmentGraphics, PIXI.SCALE_MODES.NEAREST, 2);

	var $meterWarp = $("#meter-warp");
	var x = $meterWarp.offset().left + $meterWarp.outerWidth() + 4;
	var y = ENT.wh - equipmentBoxSize - windowPadding + 3;

	var keyStyle = new PIXI.TextStyle({
		fontFamily: "Source Code Pro",
		fontSize: 16,
		fill: "#505050"
	});

	//equipmentTextGraphics.lineStyle(2, 0x505050, 0.7);

	for (var i = 0; i < window.equipmentSlots; i++) {
		var equipmentBoxSprite = new PIXI.Sprite(equipmentBoxTexture);
		equipmentBoxSprite.x = x;
		equipmentBoxSprite.y = y;
		equipmentBoxSprite.isBox = true;
		equipmentContainer.addChild(equipmentBoxSprite);
		equipmentBoxes.push(equipmentBoxSprite);

		var equipmentListing = ENT.localPlayer.equipmentListings[i];

		if (equipmentListing != undefined) {
			var equipmentListingSprite = new PIXI.Sprite(PIXI.loader.resources[equipmentListing.texture].texture);
			equipmentListingSprite.width = equipmentBoxSize - 16;
			equipmentListingSprite.height = equipmentBoxSize - 16;
			equipmentListingSprite.anchor.set(0.5, 0.5);
			equipmentListingSprite.x = x + equipmentBoxSize / 2;
			equipmentListingSprite.y = y + equipmentBoxSize / 2;
			equipmentContainer.addChild(equipmentListingSprite);
			equipmentListingSprites[i] = equipmentListingSprite;
		}

		var roundedRectX = x + equipmentBoxSize - equimentTextBoxSize - 4;
		var roundedRectY = y + equipmentBoxSize - equimentTextBoxSize - 4;

		//equipmentTextGraphics.drawRoundedRect(roundedRectX, roundedRectY, equimentTextBoxSize, equimentTextBoxSize, 4);

		var keyString = (i != 9 ? i + 1 : "O").toString();
		var keyTextMetrics = PIXI.TextMetrics.measureText(keyString, keyStyle);
		var keyText = new PIXI.Text(keyString, keyStyle);
		keyText.cacheAsBitmap = true;
		keyText.x = roundedRectX + equimentTextBoxSize / 2 - keyTextMetrics.width / 2;
		keyText.y = roundedRectY + equimentTextBoxSize / 2 - keyTextMetrics.height / 2;

		equipmentTextContainer.addChild(keyText);

		x += equipmentBoxSize + 4;
	}
}