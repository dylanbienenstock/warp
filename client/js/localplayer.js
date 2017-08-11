var playerSprite;
var playerId = -1;
var destX = 0;
var destY = 0;

function setLocalPlayerSprite(sprite) {
	playerSprite = sprite;
}

function setLocalPlayerId(id) {
	playerId = id;
}

function setLocalPlayerPosition(x, y) {
	if (playerSprite != undefined) {
		destX = x;
		destY = y;
	}
}

function centerViewOnLocalPlayer() {
	centerOn(playerSprite);
}

function getLocalPlayerId() {
	return playerId;
}

function getLocalPlayerAngle() {
	if (playerSprite != undefined) {
		var mousePos = getMousePosition();

		return Math.atan2(playerSprite.position.y - mousePos.y, playerSprite.position.x - mousePos.x);
	}

	return 0;
}

function lerp(v0, v1, t) {
	return (1 - t) * v0 + t * v1;
}

function updateLocalPlayer() {
	if (playerSprite != undefined) {
		playerSprite.x = lerp(playerSprite.x, destX, 0.075);
		playerSprite.y = lerp(playerSprite.y, destY, 0.075);
	}

	centerViewOnPlayer();
}

$(function() {
	$(window).mousemove(function(event) {
		if (playerSprite != undefined) {
			playerSprite.rotation = getPlayerAngle();
		}
	});

	$(window).keydown(function(event) {
		switch (event.key)
		{
			case "w":
			case "W":
				sendControl("thrustForward", true);
				break;
			case "s":
			case "S":
				sendControl("thrustBackward", true);
				break;
			case "a":
			case "A":
				sendControl("thrustForward", true);
				break;
			case "d":
			case "D":
				sendControl("thrustBackward", true);
				break;
		}
	});

	$(window).keyup(function(event) {
		switch (event.key)
		{
			case "w":
			case "W":
				sendControl("thrustForward", false);
				break;
			case "s":
			case "S":
				sendControl("thrustBackward", false);
				break;
			case "a":
			case "A":
				sendControl("thrustForward", false);
				break;
			case "d":
			case "D":
				sendControl("thrustBackward", false);
				break;
		}
	});

	setInterval(function() {
		if (playerSprite != undefined) {
			var angle = getPlayerAngle();
			sendAngle(angle);
		}
	}, 1000 / 8);
});