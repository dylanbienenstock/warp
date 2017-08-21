window.zoom = 2;

const boundaryRadius = 1024;

var renderer;
var baseContainer;
var gridContainer;
var stageContainer;
var boundaryContainer;
var grid;

var localPlayerSprite;
var thrustForwardSprite;
var thrustBackwardSprite;
var placeholder;

$(function() {
	renderer = new PIXI.CanvasRenderer($(window).innerWidth(), $(window).innerHeight());

	document.body.appendChild(renderer.view);

	baseContainer = new PIXI.Container();
	gridContainer = new PIXI.Container();
	stageContainer = new PIXI.Container();
	boundaryContainer = new PIXI.Container();

	baseContainer.addChild(gridContainer, stageContainer, boundaryContainer);

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
		.add("thrust:default:forward", "./img/thrust/default/forward.svg")
		.add("thrust:default:backward","./img/thrust/default/backward.svg")
		.add("placeholder", "./img/placeholder.png")
	.load(setup);
}

function setup() {
	placeholder = new PIXI.Sprite(PIXI.loader.resources["placeholder"].texture);
	placeholder.anchor.set(0.5, 0.5);
	stageContainer.addChild(placeholder);

	setupHUD(baseContainer);
	connect();
	update();
}

function update() {
	window.requestAnimationFrame(update);

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

function getMousePosition() {
	return stageContainer.toLocal(renderer.plugins.interaction.mouse.global);
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