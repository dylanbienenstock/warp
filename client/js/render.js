var renderer;
var baseContainer;
var gridContainer;
var stageContainer;
var boundaryContainer;
var HUDContainer;
var grid;

var stationOuter;
var stationInnerShadow;
var stationInner;

window.boundaryRadius = 4096;
window.zoom = 2;

$(function() {
	renderer = new PIXI.CanvasRenderer($(window).innerWidth(), $(window).innerHeight());

	document.body.appendChild(renderer.view);

	baseContainer = new PIXI.Container();
	gridContainer = new PIXI.Container();
	stageContainer = new PIXI.Container();
	boundaryContainer = new PIXI.Container();
	HUDContainer = new PIXI.Container();

	baseContainer.addChild(gridContainer, stageContainer, boundaryContainer, HUDContainer);

	grid = new PIXI.Graphics();
	gridContainer.addChild(grid);

	boundary = new PIXI.Graphics();
	boundaryContainer.addChild(boundary)

	boundary.lineStyle(1, 0xFFFFFF, 1);
	boundary.drawCircle(0, 0, boundaryRadius);

	ENT.stageContainer = stageContainer;

	$(window).resize(resizeRenderer);

	$(window).mousewheel(function(event) {
    	if (event.deltaY > 0) {
    		window.zoom = Math.min(window.zoom + 0.25, 3);
    	}
    	else if (event.deltaY < 0) {
    		window.zoom = Math.max(window.zoom - 0.25, 1);
    	}
	});

	resizeRenderer();
	loadContent();
});

function resizeRenderer() {
	renderer.resize($(window).innerWidth(), $(window).innerHeight());
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

	setupHUD(HUDContainer);
	connect();
	update();
}

function update() {
	window.requestAnimationFrame(update);

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

	drawGrid();
	ENT.update();
	drawHUD();
	
	renderer.render(baseContainer);
}

function drawGrid() {
	grid.clear();
	
	var line = grid.lineStyle(1, 0xFFFFFF, 0.5);
	var ww = $(window).innerWidth();
	var wh = $(window).innerHeight();

	for (var x = 0; x < ww; x++) {
		if (Math.floor(stageContainer.pivot.x + x) % 256 == 0) {
			line.moveTo(x, 0);
			line.lineTo(x, wh);
		}
	}

	for (var y = 0; y < wh; y++) {
		if (Math.floor(stageContainer.pivot.y + y) % 256 == 0) {
			line.moveTo(0, y);
			line.lineTo(ww, y);
		}
	}
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
	stageContainer.position.x = renderer.width / 2;
	stageContainer.position.y = renderer.height / 2;
	stageContainer.scale.x = window.zoom;
	stageContainer.scale.y = window.zoom;
	stageContainer.pivot.x = sprite.position.x;
	stageContainer.pivot.y = sprite.position.y;

	boundaryContainer.position.x = renderer.width / 2;
	boundaryContainer.position.y = renderer.height / 2;
	boundaryContainer.scale.x = window.zoom;
	boundaryContainer.scale.y = window.zoom;
	boundaryContainer.pivot.x = sprite.position.x;
	boundaryContainer.pivot.y = sprite.position.y;
}