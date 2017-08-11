var playerSprite;

function setPlayerSprite(sprite) {
	playerSprite = sprite;
}

function centerViewOnPlayer() {
	centerOn(playerSprite);
}

function updatePlayer() {
	centerViewOnPlayer();
}

$(function() {
	$(window).mousemove(function(event){
		console.log(getMousePosition());
	});
});