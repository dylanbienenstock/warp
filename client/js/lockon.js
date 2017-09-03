var lockMaxRadius = 128;
var lockMinRadius = 40;
var lockRadius = lockMaxRadius;
var lockingGraphics;
var lockedSprite;

var lockingPlayerId = null;
window.lockedPlayerId = null;

function setupLockOn() {
	lockOnGraphics = new PIXI.Graphics();
	lockOnGraphics.zIndex = 96;

	lockedSprite = new PIXI.Sprite(PIXI.loader.resources["lockon"].texture);
	lockedSprite.anchor.set(0.5, 0.5);
	lockedSprite.renderable = false;
	lockedSprite.alpha = 0.5;
	lockedSprite.zIndex = 97;

	ENT.stageContainer.addChild(lockOnGraphics, lockedSprite);
}

function updateLockOn() {
	lockOnGraphics.clear();

	if (ENT.localPlayer != undefined && ENT.localPlayer.alive) {
		ENT.getPlayerById(window.lockedPlayerId, function(lockedPlayer) {
			lockedSprite.x = lockedPlayer.sprite.x;
			lockedSprite.y = lockedPlayer.sprite.y;
			lockedSprite.width = lerp(lockedSprite.width, 96, 0.25);
			lockedSprite.height = lockedSprite.width;
			lockedSprite.renderable = true;
		}, function() {
			lockedSprite.renderable = false;
		});

		var closestPlayerId;
		var closestPlayerDistance = Infinity;
		var mousePosition = getMousePosition();

		ENT.getAllPlayers().forEach(function(player) {
			if (player.alive && player.id != ENT.localPlayer.id && (window.lockedPlayerId == undefined || player.id != window.lockedPlayerId)) {
				var distance = Math.sqrt(Math.pow(mousePosition.x - player.sprite.x, 2) +
							   Math.pow(mousePosition.y - player.sprite.y, 2));

				if (distance < lockMaxRadius && distance < closestPlayerDistance) {
					closestPlayerId = player.id;
				}
			}
		});

		if (closestPlayerId != undefined) {
			if (lockingPlayerId == undefined || closestPlayerId != lockingPlayerId) {
				lockRadius = lockMaxRadius;
				lockingPlayerId = closestPlayerId;
			}

			ENT.getPlayerById(lockingPlayerId, function(lockingPlayer) {
				var distance2 = Math.sqrt(Math.pow(mousePosition.x - lockingPlayer.sprite.x, 2) + 
								Math.pow(mousePosition.y - lockingPlayer.sprite.y, 2));

				if (distance2 > lockRadius) {
					lockingPlayerId = undefined;
				} else {
					lockOnGraphics.beginFill(0xFF0000, 0.5);
					lockOnGraphics.drawCircle(lockingPlayer.sprite.x, lockingPlayer.sprite.y, lockRadius);
					lockOnGraphics.endFill();

					lockRadius -= 1;

					if (lockRadius <= lockMinRadius) {
						window.lockedPlayerId = lockingPlayerId;
						lockedSprite.width = 256;
						lockedSprite.height = 256;
						lockedSprite.renderable = false;

						sendLockOn(window.lockedPlayerId);
					}
				}
			});
		}
	}
}