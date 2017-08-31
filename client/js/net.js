var socket;

function connect(name) {
	var accepted = false;

	socket = io();

	socket.emit("name request", name);

	socket.on("name response", function(response) {
		if (!accepted) {
			processResponse(response);
			accepted = response.accepted;

			if (response.accepted) {
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

				socket.on("quadtree", function(data) {
					window.quadTreeData = data;
				});
			}
		}
	});
}

function sendControl(control, down) {
	ENT.localPlayer.controls[control] = down;
	socket.emit("control " + (down ? "down" : "up"), control);
}

function sendAngle(angle) {
	socket.emit("angle", angle);
}

var sendViewportDimensionsTimeout;

function sendViewportDimensions() {
	clearTimeout(sendViewportDimensionsTimeout);

	setTimeout(function() {
		socket.emit("viewport", {
			width: $(window).width() * (1 / window.destZoom),
			height: $(window).height() * (1 / window.destZoom )
		});
	});
}

function bindControls() {
	$("body").mousemove(function(event) {
		if (window.shopOpen) return;

		if (ENT.localPlayer != undefined && ENT.localPlayer.alive) {
			var mousePos = getMousePosition();
			ENT.localPlayer.sprite.rotation = Math.atan2(ENT.localPlayer.sprite.position.y - mousePos.y,
														 ENT.localPlayer.sprite.position.x - mousePos.x);
		}
	});
	
	$(window).resize(function() {
		sendViewportDimensions();
	});

	$(window).keydown(function(event) {
		if (window.shopOpen) return;

		if (ENT.localPlayer != undefined && ENT.localPlayer != null) {
			switch (event.key)
			{
				case "w":
				case "W":
					if (!ENT.localPlayer.controls.thrustForward) {
						sendControl("thrustForward", true);
					}

					break;
				case "s":
				case "S":
					if (!ENT.localPlayer.controls.thrustBackward) {
						sendControl("thrustBackward", true);
					}

					break;
				case "a":
				case "A":
					if (!ENT.localPlayer.controls.thrustLeft) {
						sendControl("thrustLeft", true);
					}

					break;
				case "d":
				case "D":
					if (!ENT.localPlayer.controls.thrustRight) {
						sendControl("thrustRight", true);
					}

					break;
				case "Shift":
					if (!ENT.localPlayer.controls.boost) {
						sendControl("boost", true);
					}
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
					break;
				case "s":
				case "S":
					sendControl("thrustBackward", false);
					break;
				case "a":
				case "A":
					sendControl("thrustLeft", false);
					break;
				case "d":
				case "D":
					sendControl("thrustRight", false);
					break;
				case "Shift":
					sendControl("boost", false);
					break;
				case " ":
					toggleShop();
					break;
				case "o":
				case "O":
					window.overrideZoom = 0.3;
					window.useOverrideZoom = !window.useOverrideZoom;
					break;
				case "p":
				case "P":
					ENT.physicsDebug = !ENT.physicsDebug;
					break;
			}
		}
	});

	$(window).mousedown(function(event) {
		if (window.shopOpen) return;

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
		if (window.shopOpen) return;

		if (ENT.localPlayer != undefined) {
			sendAngle(ENT.localPlayer.sprite.rotation);
		}
	}, 1000 / 32);
}
