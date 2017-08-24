var socket;

function connect() {
	socket = io();

	socket.on("entity list", function(data) {
		for (var i = data.length - 1; i >= 0; i--) {
			ENT.create(ENT.new(data[i]));
		}
	});

	socket.on("entity create", function(data) {
		var entity = ENT.create(ENT.new(data));

		if (data.playerSocketId == socket.id) {
			ENT.localPlayer = entity;
			entity.isLocalPlayer = true;
		}
	});

	socket.on("entity remove", function(id) {
		ENT.removeById(id);
	});

	socket.on("entity set", function(data) {
		for (var i = data.length - 1; i >= 0; i--) {
			var data2 = data[i];

			ENT.getById(data2.id, function(entity) {
				entity.setProperties(data2.properties);
			});
		}
	});

	socket.on("entity trigger", function(data) {
		ENT.getById(data.id, function(entity) {
			if (entity.triggers.hasOwnProperty(data.trigger)) {
				entity.triggers[data.trigger](data.triggerData);
			}
		});
	});
}

function sendControl(control, down) {
	socket.emit("control " + (down ? "down" : "up"), control);
}

function sendAngle(angle) {
	socket.emit("angle", angle);
}

$(function() {
	$(window).mousemove(function(event) {
		if (ENT.localPlayer != undefined) {
			var mousePos = getMousePosition();
			ENT.localPlayer.sprite.rotation = Math.atan2(ENT.localPlayer.sprite.position.y - mousePos.y,
														 ENT.localPlayer.sprite.position.x - mousePos.x);
		}
	});

	$(window).keydown(function(event) {
		if (ENT.localPlayer != undefined && ENT.localPlayer != null) {
			switch (event.key)
			{
				case "w":
				case "W":
					if (!ENT.localPlayer.controls.thrustForward) {
						sendControl("thrustForward", true);
						ENT.localPlayer.controls.thrustForward = true;
					}

					break;
				case "s":
				case "S":
					if (!ENT.localPlayer.controls.thrustBackward) {
						sendControl("thrustBackward", true);
						ENT.localPlayer.controls.thrustBackward = true;
					}

					break;
				case "a":
				case "A":
					if (!ENT.localPlayer.controls.thrustLeft) {
						sendControl("thrustLeft", true);
						ENT.localPlayer.controls.thrustLeft = true;
					}

					break;
				case "d":
				case "D":
					if (!ENT.localPlayer.controls.thrustRight) {
						sendControl("thrustRight", true);
						ENT.localPlayer.controls.thrustRight = true;
					}

					break;
			}
		}
	});

	$(window).keyup(function(event) {
		if (ENT.localPlayer != undefined && ENT.localPlayer != null) {
			switch (event.key)
			{
				case "w":
				case "W":
					sendControl("thrustForward", false);
					ENT.localPlayer.controls.thrustForward = false;
					break;
				case "s":
				case "S":
					sendControl("thrustBackward", false);
					ENT.localPlayer.controls.thrustBackward = false;
					break;
				case "a":
				case "A":
					sendControl("thrustLeft", false);
					ENT.localPlayer.controls.thrustLeft = false;
					break;
				case "d":
				case "D":
					sendControl("thrustRight", false);
					ENT.localPlayer.controls.thrustRight = false;
					break;
				case "p":
				case "P":
					ENT.physicsDebug = !ENT.physicsDebug;
			}
		}
	});

	$(window).mousedown(function(event) {
		switch (event.which) {
			case (1):
				if (!ENT.localPlayer.controls.firePrimary) {
					sendControl("firePrimary", true);
					ENT.localPlayer.controls.firePrimary = true;
				}

				break;
			case (3):
				if (!ENT.localPlayer.controls.fireSecondary) {
					sendControl("fireSecondary", true);
					ENT.localPlayer.controls.fireSecondary = true;
				}

				break;
		}
	});

	$(window).mouseup(function(event) {
		switch (event.which) {
			case (1):
				sendControl("firePrimary", false);
				ENT.localPlayer.controls.firePrimary = false;

				break;
			case (3):
				sendControl("fireSecondary", false);
				ENT.localPlayer.controls.fireSecondary = false;

				break;
		}
	});

	setInterval(function() {
		if (ENT.localPlayer != undefined) {
			sendAngle(ENT.localPlayer.sprite.rotation);
		}
	}, 1000 / 32);
});
