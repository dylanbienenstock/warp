var renderer;
var stage;

var localPlayerSprite;
var thrustForwardSprite;
var thrustBackwardSprite;
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
		.add("./img/thrust/default/forward.svg")
		.add("./img/thrust/default/backward.svg")
		.add("./img/placeholder.png")
		.load(setup);
}

function setup() {
	localPlayerSprite = new PIXI.Sprite(PIXI.loader.resources["./img/ships/default.svg"].texture);
	localPlayerSprite.anchor.set(0.678, 0.5); // TO DO: Set anchor to SVG origin
	localPlayerSprite.width = 32;
	localPlayerSprite.height = 32;

	thrustForwardSprite = new PIXI.Sprite(PIXI.loader.resources["./img/thrust/default/forward.svg"].texture);
	thrustForwardSprite.anchor.set(0.475, 0.5);
	thrustForwardSprite.width = 44;
	thrustForwardSprite.height = 32;

	thrustBackwardSprite = new PIXI.Sprite(PIXI.loader.resources["./img/thrust/default/backward.svg"].texture);
	thrustBackwardSprite.anchor.set(0.678, 0.5);
	thrustBackwardSprite.width = 32;
	thrustBackwardSprite.height = 32;

	placeholder = new PIXI.Sprite(PIXI.loader.resources["./img/placeholder.png"].texture);
	placeholder.anchor.set(0.5, 0.5);

	setLocalPlayerSprites(localPlayerSprite, thrustForwardSprite, thrustBackwardSprite);

	stage.addChild(placeholder);
	stage.addChild(localPlayerSprite);
	stage.addChild(thrustForwardSprite);
	stage.addChild(thrustBackwardSprite);

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