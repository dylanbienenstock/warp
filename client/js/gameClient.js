var renderer;
var stage;

var ship;

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
		.load(finishedLoading);
}

function finishedLoading() {
	ship = new PIXI.Sprite(PIXI.loader.resources["./img/ships/default.svg"].texture);
	ship.anchor.set(0.5, 0.5);
	ship.width = 64;
	ship.height = 64;

	stage.addChild(ship);

	window.requestAnimationFrame(update);
}

function update() {
	draw();
}

function draw() {
	centerOn(ship);

	ship.rotation += 0.01;

	renderer.render(stage);
	window.requestAnimationFrame(update);
}

function centerOn(sprite) {
	stage.position.x = renderer.width / 2;
	stage.position.y = renderer.height / 2;
	// stage.scale.x = 2.0;
	// stage.scale.y = 2.0;
	stage.pivot.x = sprite.position.x;
	stage.pivot.y = sprite.position.y;
}