var playerSprite;
var playerId = -1;
var destX = 0;
var destY = 0;

function setPlayerSprite(sprite) {
	playerSprite = sprite;
}

function setPlayerId(id) {
	playerId = id;
}

function setPlayerPosition(x, y, vx, vy) {
	if (playerSprite != undefined) {
		destX = x;
		destY = y;
		//playerSprite.x = x;
		//playerSprite.y = y;
	}
}

function centerViewOnPlayer() {
	centerOn(playerSprite);
}

function getPlayerId() {
	return playerId;
}

function getPlayerAngle() {
	if (playerSprite != undefined) {
		var mousePos = getMousePosition();

		return Math.atan2(playerSprite.position.y - mousePos.y, playerSprite.position.x - mousePos.x);
	}

	return 0;
}

function lerp(v0, v1, t) {
	return (1 - t) * v0 + t * v1;
}

function updatePlayer() {
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
		}
	});

	$(window).keyup(function(event) {
		switch (event.key)
		{
			case "w":
			case "W":
				sendControl("thrustForward", false);
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