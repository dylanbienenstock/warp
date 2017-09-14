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
				for (var i = 0; i < response.shopListings.length; i++) {
					addShopListing(response.shopListings[i]);
				}

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
							if (entity.receiveProperties instanceof Function) {
								data2.properties = entity.receiveProperties(data2.properties) || data2.properties;
							}

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

				socket.on("chat in", function(data) {
					displayChatMessage(data.name, data.hue, data.message);
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

function sendLockOn(id) {
	socket.emit("lockon", id);
}

function sendBuyShip(className) {
	socket.emit("buy ship", {
		className: className
	});
}

function sendBuyWeapon(className, primary) {
	socket.emit("buy weapon", {
		className: className,
		primary: primary
	});
}

function sendBuySpecialWeapon(className) {
	socket.emit("buy special", {
		className: className
	});
}

function sendChatMessage(message) {
	socket.emit("chat out", message);
}

var boundControls = {};

function bindKeyToFunction(key, downCallback, upCallback) {
	if (downCallback instanceof Function) {
		boundControls[key] = {};
		boundControls[key].down = downCallback;
	}

	if (upCallback instanceof Function) {
		boundControls[key].up = upCallback;
	}
}

function bindPlayerControl(key, control) {
	bindKeyToFunction(key,
		function() {
			if (!window.shopOpen && !ENT.localPlayer.controls[control]) {
				sendControl(control, true);
			}
		},

		function() {
			sendControl(control, false);
		}
	);
}

function getBinds() {
	bindPlayerControl(87, "thrustForward"); 	// W
	bindPlayerControl(83, "thrustBackward"); 	// A
	bindPlayerControl(65, "thrustLeft"); 		// S
	bindPlayerControl(68, "thrustRight"); 		// D
	bindPlayerControl(32, "fireSpecial");		// Space
	bindPlayerControl(16, "boost");				// Shift

	bindKeyToFunction(81, function() {			// Q
		if (window.connected) {
			toggleShop();
		}
	});

	bindKeyToFunction(80, function() {			// P
		ENT.physicsDebug = !ENT.physicsDebug;

		$("#fps-meter-container").stop().fadeToggle();
	});

	bindKeyToFunction(13, focusOnChat);			// Enter
}

function bindControls() {
	getBinds();

	$(window).mousemove(function(event) {
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
		if (!window.chatting &&
			ENT.localPlayer != undefined &&
			ENT.localPlayer != null &&
			boundControls.hasOwnProperty(event.which) &&
			boundControls[event.which].down instanceof Function) {
			
			boundControls[event.which].down();
		}
	});

	$(window).keyup(function(event) {
		if (ENT.localPlayer != undefined &&
			ENT.localPlayer != null &&
			boundControls.hasOwnProperty(event.which) &&
			boundControls[event.which].up instanceof Function) {
			
			boundControls[event.which].up();
		}
	});

	$(window).mousedown(function(event) {
		if (window.shopOpen || window.chatting) return;

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
