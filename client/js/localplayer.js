var playerSprite;
var thrustForwardSprite;
var thrustBackwardSprite;

var playerId = -1;
var destX = 0;
var destY = 0;

var controls = {
	thrustForward: false,
	thrustBackward: false,
	thrustLeft: false,
	thrustRight: false
};

function setLocalPlayerSprites(__playerSprite, __thrustForwardSprite, __thrustBackwardSprite) {
	playerSprite = __playerSprite;
	thrustForwardSprite = __thrustForwardSprite;
	thrustBackwardSprite = __thrustBackwardSprite;
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

	thrustForwardSprite.x = playerSprite.x;
	thrustForwardSprite.y = playerSprite.y;
	thrustForwardSprite.rotation = playerSprite.rotation;
	thrustForwardSprite.visible = controls.thrustForward;

	thrustBackwardSprite.x = playerSprite.x;
	thrustBackwardSprite.y = playerSprite.y;
	thrustBackwardSprite.rotation = playerSprite.rotation;
	thrustBackwardSprite.visible = controls.thrustBackward;

	centerViewOnLocalPlayer();
}

$(function() {
	$(window).mousemove(function(event) {
		if (playerSprite != undefined) {
			playerSprite.rotation = getLocalPlayerAngle();
		}
	});

	$(window).keydown(function(event) {
		switch (event.key)
		{
			case "w":
			case "W":
				sendControl("thrustForward", true);
				controls.thrustForward = true;
				break;
			case "s":
			case "S":
				sendControl("thrustBackward", true);
				controls.thrustBackward = true;
				break;
			case "a":
			case "A":
				sendControl("thrustLeft", true);
				controls.thrustLeft = true;
				break;
			case "d":
			case "D":
				sendControl("thrustRight", true);
				controls.thrustRight = true;
				break;
		}
	});

	$(window).keyup(function(event) {
		switch (event.key)
		{
			case "w":
			case "W":
				sendControl("thrustForward", false);
				controls.thrustForward = false;
				break;
			case "s":
			case "S":
				sendControl("thrustBackward", false);
				controls.thrustBackward = false;
				break;
			case "a":
			case "A":
				sendControl("thrustLeft", false);
				controls.thrustLeft = false;
				break;
			case "d":
			case "D":
				sendControl("thrustRight", false);
				controls.thrustRight = false;
				break;
		}
	});

	setInterval(function() {
		if (playerSprite != undefined) {
			var angle = getLocalPlayerAngle();
			sendAngle(angle);
		}
	}, 1000 / 8);
});