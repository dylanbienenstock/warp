var renderer;
var stage;

var ship;
var placeholder;

$(function() {
	renderer = new PIXI.CanvasRenderer($(window).innerWidth(), $(window).innerHeight());

	document.body.appendChild(renderer.view);

	stage = new PIXI.Container();
	renderer.render(stage);

	$(window).resize(resizeRenderer);

	resizeRenderer();
	loadContent();
});

function resizeRenderer() {
	renderer.resize($(window).innerWidth(), $(window).innerHeight());
}

function loadContent() {
	PIXI.loader
		.add("./img/ships/default.svg")
		.add("./img/placeholder.png")
		.load(setup);
}

function setup() {
	ship = new PIXI.Sprite(PIXI.loader.resources["./img/ships/default.svg"].texture);
	ship.anchor.set(0.675, 0.5); // TO DO: Set anchor to SVG origin
	ship.width = 32;
	ship.height = 32;

	placeholder = new PIXI.Sprite(PIXI.loader.resources["./img/placeholder.png"].texture);
	placeholder.anchor.set(0.5, 0.5);

	setLocalPlayerSprite(ship);
	stage.addChild(placeholder);
	stage.addChild(ship);

	window.requestAnimationFrame(update);
}

function update() {
	updateLocalPlayer();

	renderer.render(stage);
	window.requestAnimationFrame(update);
}

function getRenderer() {
	return renderer;
}

function getStage() {
	return stage;
}

function getMousePosition() {
	return stage.toLocal(renderer.plugins.interaction.mouse.global);
}

function centerOn(sprite) {
	stage.position.x = renderer.width / 2;
	stage.position.y = renderer.height / 2;
	stage.scale.x = 2.0;
	stage.scale.y = 2.0;
	stage.pivot.x = sprite.position.x;
	stage.pivot.y = sprite.position.y;
}