var renderer;
var state;

$(function() {
	renderer = PIXI.autoDetectRenderer(256, 256);
	document.body.appendChild(renderer.view);

	stage = new PIXI.Container();
	renderer.render(stage);

	$(window).resize(onResize);
});

function onResize() {
	renderer.resize($(window).innerWidth(), $(window).innerHeight());
}