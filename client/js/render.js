var renderer;
var baseContainer;
var titleScreenContainer;
var gameContainer;
var backdropContainer;
var stageContainer;
var boundaryContainer;
var HUDContainer;
var blackness;

var stationOuter;
var stationInnerShadow;
var stationInner;

window.renderer;
window.boundaryRadius = 4096;
window.protectedSpaceRadius = 600;
window.DMZRadius = 200;

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

$(function() {
	var ww = $(window).innerWidth();
	var wh = $(window).innerHeight();

	window.renderer = new PIXI.CanvasRenderer(ww, wh);

	document.body.appendChild(renderer.view);

	baseContainer = new PIXI.Container();
	titleScreenContainer = new PIXI.Container();
	gameContainer = new PIXI.Container();

	backdropContainer = new PIXI.Container();
	stageContainer = new PIXI.Container();
	boundaryContainer = new PIXI.Container();
	HUDContainer = new PIXI.Container();

	blackness = new PIXI.Graphics();
	blackness.beginFill(0x000000);
	blackness.drawRect(0, 0, ww, wh);
	blackness.endFill();
	blackness.cacheAsBitmap = true;

	backdropContainer.addChild(blackness);
	gameContainer.addChild(backdropContainer, boundaryContainer, stageContainer, HUDContainer);
	baseContainer.addChild(titleScreenContainer, gameContainer);

	setupTitleScreen(titleScreenContainer, gameContainer);

	ENT.stageContainer = stageContainer;

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
	loadContent();
});

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

	blackness.clear();
	blackness.beginFill(0x000000);
	blackness.drawRect(0, 0, $(window).innerWidth(), $(window).innerHeight());
	blackness.endFill();
	blackness.cacheAsBitmap = true;
}

function loadContent() {
	PIXI.loader
		.add("ship:default", "./img/ships/default.svg")
		.add("ship:default:outline", "./img/ships/default-outline.svg")
		.add("ship:default:shadow", "./img/ships/default-shadow.svg")
		.add("thrust:default:forward", "./img/thrust/default/forward.svg")
		.add("thrust:default:backward","./img/thrust/default/backward.svg")
		.add("shield", "./img/shield.svg")
		.add("station:outer", "./img/station-outer.svg")
		.add("station:inner", "./img/station-inner.svg")
		.add("station:inner:shadow", "./img/station-inner-shadow.svg")
		.add("planet:shadow", "./img/planet-shadow.svg")
	.load(setup);
}

function setup() {
	var stationContainer = new PIXI.Container();

	stationOuter = new PIXI.Sprite(PIXI.loader.resources["station:outer"].texture);
	stationOuter.width = 512;
	stationOuter.height = 512;
	stationOuter.anchor.set(0.5, 0.5);

	stationInnerShadow = new PIXI.Sprite(PIXI.loader.resources["station:inner:shadow"].texture);
	stationInnerShadow.width = 512;
	stationInnerShadow.height = 512;
	stationInnerShadow.x = 2;
	stationInnerShadow.y = 2;
	stationInnerShadow.alpha = 0.5;
	stationInnerShadow.anchor.set(0.5, 0.5);

	stationInner = new PIXI.Sprite(PIXI.loader.resources["station:inner"].texture);
	stationInner.width = 512;
	stationInner.height = 512;
	stationInner.anchor.set(0.5, 0.5);

	stationContainer.addChild(stationOuter, stationInnerShadow, stationInner);
	stageContainer.addChild(stationContainer);

	setupBackdrop(backdropContainer);
	setupHUD(HUDContainer);
	update();
}

function update() {
	window.requestAnimationFrame(update);

	updateTitleScreen(baseContainer, titleScreenContainer, gameContainer);

	ENT.stageContainer.children.sort(function(a, b) {
		a.zIndex = a.zIndex || 0;
		b.zIndex = b.zIndex || 0;

		if (a.zIndex > b.zIndex) return 1;
		if (a.zIndex < b.zIndex) return -1;

		return 0;
	}); 

	stationOuter.rotation += 0.001;
	stationInnerShadow.rotation += 0.00025;
	stationInner.rotation += 0.00025;

	renderBackdrop();
	ENT.update();
	drawHUD();
	
	renderer.render(baseContainer);
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
	stageContainer.pivot.x = sprite.position.x;
	stageContainer.pivot.y = sprite.position.y;

	boundaryContainer.position.x = renderer.width / 2;
	boundaryContainer.position.y = renderer.height / 2;
	boundaryContainer.scale.x = window.currentZoom;
	boundaryContainer.scale.y = window.currentZoom;
	boundaryContainer.pivot.x = sprite.position.x;
	boundaryContainer.pivot.y = sprite.position.y;

	var players = ENT.getAllByClassName("Player");

	for (var i = players.length - 1; i >= 0; i--) {
		players[i].updateNameTag();
	}
}