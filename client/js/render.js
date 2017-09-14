var renderer;
var baseContainer;
var titleScreenContainer;
var gameContainer;
var backdropContainer;
var stageContainer;
var boundaryContainer;
var nameTagContainer;
var HUDContainer;
var blackness;

var stationOuter;
var stationInnerShadow;
var stationInner;

window.renderer;
window.boundaryRadius = 4096;
window.protectedSpaceRadius = 600;
window.DMZRadius = 200;

window.inGame = false;

window.maxZoom = 3;
window.minZoom = 1;
window.zoomLerpFactor = 0.2;
window.zoomIncrement = 0.1;
window.currentZoom = 1.5;
window.scrollZoom = window.currentZoom;
window.destZoom = window.currentZoom;
window.lastDestZoom = window.currentZoom;
window.overrideZoom = -1;
window.useOverrideZoom = false;

window.fpsMeter = null;

$(function() {
	// Disable context menu
	document.oncontextmenu = function () {
	  return false;
	};

	window.addEventListener("contextmenu", function (e) {
	  e.preventDefault();
	}, false);
});

function createPIXIRenderer() {
	var ww = $(window).innerWidth();
	var wh = $(window).innerHeight();

	window.renderer = new PIXI.CanvasRenderer(ww, wh);
	window.renderer.backgroundColor = 0x000000;

	document.body.appendChild(renderer.view);

	baseContainer = new PIXI.Container();
	titleScreenContainer = new PIXI.Container();
	gameContainer = new PIXI.Container();

	backdropContainer = new PIXI.Container();
	stageContainer = new PIXI.Container();
	boundaryContainer = new PIXI.Container();
	nameTagContainer = new PIXI.Container();
	HUDContainer = new PIXI.Container();

	gameContainer.addChild(backdropContainer, boundaryContainer, stageContainer, HUDContainer);
	baseContainer.addChild(titleScreenContainer, gameContainer, nameTagContainer);

	setupTitleScreen(titleScreenContainer, gameContainer);

	ENT.stageContainer = stageContainer;
	ENT.nameTagContainer = nameTagContainer;

	$(window).resize(resizeRenderer);

	$(window).mousewheel(function(event) {
    	if (event.deltaY > 0) {
    		window.scrollZoom = Math.min(window.scrollZoom + window.zoomIncrement * window.scrollZoom, window.maxZoom);
    	}
    	else if (event.deltaY < 0) {
    		window.scrollZoom = Math.max(window.scrollZoom - window.zoomIncrement * window.scrollZoom, window.minZoom);
    	}
	});

	drawBoundary();
	resizeRenderer();
	loadContent(setup);

	window.fpsMeter = new FPSMeter(document.getElementById("fps-meter-container"), {
		left: "initial",
		right: "5px",
		graph: 1
	});
};

function drawBoundary() {
	boundary = new PIXI.Graphics();
	boundaryContainer.addChild(boundary)

	// Map boundary
	boundary.lineStyle(1, 0xFFFFFF, 1);
	boundary.drawCircle(0, 0, window.boundaryRadius);

	// DMZ
	boundary.beginFill(0x00FF00, 0.11);
	boundary.lineStyle();
	boundary.drawCircle(0, 0, window.protectedSpaceRadius + window.DMZRadius);
	boundary.endFill();

	// Protected space
	boundary.beginFill(0x00FF00, 0.04);
	boundary.lineStyle(1, 0x00FF00, 0.5);
	boundary.drawCircle(0, 0, window.protectedSpaceRadius);
	boundary.endFill();
}

function resizeRenderer() {
	renderer.resize($(window).innerWidth(), $(window).innerHeight());
}

function setup() {
	setupBackdrop(backdropContainer);
	setupHUD(HUDContainer);
	setupLockOn();
	update();
}

function update() {
	window.requestAnimationFrame(update);

	if (!window.inGame) {
		updateTitleScreen(baseContainer, titleScreenContainer, gameContainer);
	}

	ENT.stageContainer.children.sort(function(a, b) {
		a.zIndex = a.zIndex || 0;
		b.zIndex = b.zIndex || 0;

		if (a.zIndex > b.zIndex) return 1;
		if (a.zIndex < b.zIndex) return -1;

		return 0;
	}); 

	renderBackdrop();
	ENT.update();
	updateLockOn();
	drawHUD();
	
	renderer.render(baseContainer);
	window.fpsMeter.tick();
}

function getRenderer() {
	return renderer;
}

function getStage() {
	return stageContainer;
}

function getHUD() {
	return hudContainer;
}

function centerOn(sprite) {
	window.destZoom = (window.useOverrideZoom ? window.overrideZoom : window.scrollZoom);
	window.currentZoom = lerp(window.currentZoom, window.destZoom, window.zoomLerpFactor);

	if (window.currentZoom != window.lastDestZoom) {
		sendViewportDimensions();
	}

	window.lastDestZoom = window.currentZoom;

	stageContainer.position.x = renderer.width / 2;
	stageContainer.position.y = renderer.height / 2;
	stageContainer.scale.x = window.currentZoom;
	stageContainer.scale.y = window.currentZoom;
	stageContainer.pivot = sprite.position;

	boundaryContainer.position.x = renderer.width / 2;
	boundaryContainer.position.y = renderer.height / 2;
	boundaryContainer.scale.x = window.currentZoom;
	boundaryContainer.scale.y = window.currentZoom;
	boundaryContainer.pivot = sprite.position;
}