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
						if (ENT.localPlayer != undefined) {
							ENT.localPlayer.isLocalPlayer = false;
						}

						ENT.localPlayer = entity;
						entity.isLocalPlayer = true;
						window.equipmentDirty = true;
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

function sendBuyEquipment(className) {
	socket.emit("buy equipment", {
		className: className
	});
}

function sendChatMessage(message) {
	socket.emit("chat out", message);
}

function sendWarp(position) {
	socket.emit("warp", position);
}

function aimAtPosition(position) {
	if (ENT.localPlayer != undefined && ENT.localPlayer.alive) {
		ENT.localPlayer.sprite.rotation = Math.atan2(ENT.localPlayer.sprite.position.y - position.y,
													 ENT.localPlayer.sprite.position.x - position.x);
	}
}

function aimAtCursor() {
	aimAtPosition(getMousePosition());
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
			if (!window.shopOpen && !window.warping && !ENT.localPlayer.controls[control]) {
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
	bindPlayerControl(48, "useEquipment9");		// 0
	bindPlayerControl(49, "useEquipment0");		// 1
	bindPlayerControl(50, "useEquipment1");		// 2
	bindPlayerControl(51, "useEquipment2");		// 3
	bindPlayerControl(52, "useEquipment3");		// 4
	bindPlayerControl(53, "useEquipment4");		// 5
	bindPlayerControl(54, "useEquipment5");		// 6
	bindPlayerControl(55, "useEquipment6");		// 7
	bindPlayerControl(56, "useEquipment7");		// 8
	bindPlayerControl(57, "useEquipment8");		// 9

	bindKeyToFunction(81, function() {			// Q
		if (window.connected) {
			toggleShop();
		}
	});

	bindKeyToFunction(80, function() {			// P
		ENT.physicsDebug = !ENT.physicsDebug;

		$("#fps-meter-container").stop().fadeToggle();
	});

	bindKeyToFunction(70, function() {			// F
		$(document).toggleFullScreen();
	});

	var eDown = false;
	bindKeyToFunction(69, function() {			// E
		if (!eDown) {
			eDown = true;
			window.aboutToWarp = true;
			sendControl("firePrimary", false);
		}
	}, function() {
		eDown = false;
		window.aboutToWarp = false;
		aimAtCursor();
	});

	bindKeyToFunction(13, focusOnChat);			// Enter
}

function bindControls() {
	getBinds();

	window.mouseX = 0;
	window.mouseY = 0;

	$(window).mousemove(function(event) {
		window.mouseX = event.pageX;
		window.mouseY = event.pageY;

		if (window.shopOpen || window.aboutToWarp || window.warping) return;

		aimAtCursor();
	});
	
	$(window).resize(function() {
		sendViewportDimensions();
		window.equipmentDirty = true;
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
					if (window.mouseOverEquipment) {
						beginDragEquipment();
					} else {
						if (!window.aboutToWarp) {
							sendControl("firePrimary", true);
							ENT.localPlayer.controls.firePrimary = true;
						}
					}
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
				dropEquipment();

				if (window.aboutToWarp) {
					window.warpPosition = getWarpPosition();

					if (window.warpPosition != null) {
						sendControl("boost", false);
						ENT.localPlayer.boosting = false;
						ENT.localPlayer.ship.boosting = false;

						window.aboutToWarp = false;
						window.warping = true;
						sendWarp(window.warpPosition);
					}
				} else {
					sendControl("firePrimary", false);
				}

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
