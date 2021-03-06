/*

	  ___       __   ________  ________  ________   
	 |\  \     |\  \|\   __  \|\   __  \|\   __  \  
	 \ \  \    \ \  \ \  \|\  \ \  \|\  \ \  \|\  \ 
	  \ \  \  __\ \  \ \   __  \ \   _  _\ \   ____\
	   \ \  \|\__\_\  \ \  \ \  \ \  \\  \\ \  \___|
	    \ \____________\ \__\ \__\ \__\\ _\\ \__\   
	     \|____________|\|__|\|__|\|__|\|__|\|__| 

	 	   By Dylan Bienenstock

*/


var express = require("express");
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var memwatch = require("memwatch-next");
var sanitizer = require("sanitizer");

const physicsDebug = process.env.PHYS_DEBUG;

var PHYS = require("./physics/PhysicsManager.js")(io, physicsDebug);
var Physics = require("./physics/Physics.js")(PHYS);
PHYS.Physics = Physics;

var ENT = require("./entity/EntityManager.js")(io, PHYS, physicsDebug);
var Entity = require("./entity/Entity.js")(io, ENT, PHYS);
ENT.Entity = Entity;

var Ship = require("./ship/Ship.js")(ENT, PHYS);
var Weapon = require("./weapon/Weapon.js")(ENT, PHYS);
var SpecialWeapon = require("./weapon/SpecialWeapon.js")(ENT, PHYS);
var Equipment = require("./equipment/Equipment.js")(ENT, PHYS);
var Shop = require("./Shop.js")(Ship, Weapon, SpecialWeapon, Equipment);

var NPCProfile = require("./entity/NPCProfile.js");

console.log("Initializing game...");
var startTime = Date.now();
setupGame();
startServer(startTime);

function startServer(startTime) {
	app.set("port", (process.env.PORT || 8080));

	app.use(express.static("./client"));

	app.get("/", function(req, res){
	  res.sendFile("./client/index.html");
	});

	io.on("connection", onConnect);

	http.listen(app.get("port"), function(){
		console.log("Took " + (Date.now() - startTime) + "ms to initialize game");
		console.log("Server listening on port " + app.get("port"));
		console.log();
	});

	memwatch.on("leak", function(info) {
		console.log("MEMORY LEAK", info);
	});
}

function onConnect(socket) {
	var accepted = false;

	socket.on("name request", function(name) {
		if (!accepted) {
			var response = processName(name);
			response.shopListings = Shop.getAllListings();

			accepted = response.accepted;

			socket.emit("name response", response);

			if (response.accepted) {
				acceptConnection(name, socket);
			}
		}
	});
}

function acceptConnection(name, socket) {
	ENT.sendAllEntities(socket);

	var angle = 2 * Math.PI * Math.random();

	var playerInstanceIds = [];
	var player = ENT.new("Player", {
		name: name,
		socketId: socket.client.id,
		defaultShip: "Skiff",
		x: -Math.cos(angle) * 4094,
		y: -Math.sin(angle) * 4096
	});

	ENT.create(player, socket.client.id);
	playerInstanceIds.push(player.id);

	player.ship = new Ship.Skiff(player);
	player.primaryWeapon = new Weapon.Peashooter(player);

	var onDeath = function() {
		if (player.hasEquipment("EscapePod")) {
			var player2 = ENT.new("Player", {
				name: player.name,
				socketId: socket.client.id,
				defaultShip: "EscapePod",
				x: player.ship.physicsObject.x,
				y: player.ship.physicsObject.y,
				rotation: player.ship.physicsObject.rotation,
				velocityX: -Math.cos(player.ship.physicsObject.rotation) * 128,
				velocityY: -Math.sin(player.ship.physicsObject.rotation) * 128
			});

			ENT.create(player2, socket.client.id);
			playerInstanceIds.push(player2.id);

			player2.ship = new Ship.EscapePod(player2);

			player2.onDeath = function() {
				onDeath();
			}

			player = player2;
		}
	}

	player.onDeath = function() {
		onDeath();
	}

	if (!physicsDebug) {
		console.log("+ Player " + name + " has connected.");
	}

	socket.on("disconnect", function() {
		if (!physicsDebug) {
			console.log("- Player " + name + " has disconnected.");
		}

		ENT.remove(player);
	});

	socket.on("control down", function(control) {
		player.controls[control] = true;
		player.controlDown(control);
	});

	socket.on("control up", function(control) {
		player.controls[control] = false;
		player.controlUp(control);
	});

	socket.on("angle", function(angle) {
		if (player.alive) {
			player.physicsObject.rotation = angle;
		}
	});

	socket.on("viewport", function(data) {
		player.viewport.width = data.width;
		player.viewport.height = data.height;
	});

	socket.on("lockon", function(id) {
		player.lockedPlayerId = id;
	});

	socket.on("buy ship", function(data) {
		Shop.buyShip(player, data);
	});

	socket.on("buy weapon", function(data) {
		Shop.buyWeapon(player, data);
	});

	socket.on("buy special", function(data) {
		Shop.buySpecialWeapon(player, data);
	});

	socket.on("buy equipment", function(data) {
		Shop.buyEquipment(player, data);
	});

	socket.on("chat out", function(message) {
		io.emit("chat in", {
			name: sanitizer.escape(player.name),
			hue: player.chatHue,
			message: sanitizer.escape(message)
		});
	});

	socket.on("warp", function(data) {
		player.warp(data);
	});

	socket.on("swap equipment", function(data) {
		player.swapEquipment(data.a, data.b);
	});
}

var nameValidator = /^([A-Za-z0-9\-]+)$/g;

function processName(name) {
	var players = ENT.getAllByClassName("Player");
	var response = {
		accepted: true,
		message: "Connection accepted."
	};

	for (var i = players.length - 1; i >= 0; i--) {
		if (players[i].name == name) {
			response.accepted = false;
			response.message = "That name is currently in use.";

			return response;
		}
	}

	if (name.length < 3 || name.length > 16) {
		response.accepted = false;
		response.message = "Name must be within 3 and 16 characters.";

		return response;
	}

	if (name.match(nameValidator) == null) {
		response.accepted = false;
		response.message = "Use only letters, numbers, and hyphens.";

		return response;
	}

	return response;
}

/////////////////////////////////// GAME CODE ///////////////////////////////////

function createNPC() {
	var angle = 2 * Math.PI * Math.random();

	var npc = ENT.new("Player", {
		name: "NPC",
		x: -Math.cos(angle) * PHYS.boundaryRadius,
		y: -Math.sin(angle) * PHYS.boundaryRadius,
		NPC: true,
		NPCProfile: NPCProfile.DEFAULT
	});

	ENT.create(npc);

	var shipKeys = Object.keys(Ship)
	var weaponKeys = Object.keys(Weapon);
	var primaryWeaponChoice = weaponKeys.length * Math.random() << 0;
	var secondaryWeaponChoice = weaponKeys.length * Math.random() << 0;

	while (secondaryWeaponChoice == primaryWeaponChoice) {
		secondaryWeaponChoice = weaponKeys.length * Math.random() << 0;
	}

	npc.ship = new Ship[shipKeys[shipKeys.length * Math.random() << 0]](npc);
	npc.primaryWeapon = new Weapon[weaponKeys[primaryWeaponChoice]](npc);
	npc.secondaryWeapon = new Weapon[weaponKeys[secondaryWeaponChoice]](npc);
}

function setupGame() {
	var blackHole = ENT.create(ENT.new("Sun", {
		x: 0,
		y: 0,
		color: 0x7718B2,
		isBlackHole: true
	}));

	blackHole.createUniverse();

	for (var i = 0; i < (process.env.NPCS || 0); i++) {
		createNPC();
	}
}

var update;

if (physicsDebug) {
	var performanceNow = require("performance-now");
	var physicsTimes = [];
	var avgCalculationInterval = 2500;
	var lastAvgCalculationTime = performanceNow();

	update = function() {
		var startTime = performanceNow();

		PHYS.update(1);

		physicsTimes.push(performanceNow() - startTime);

		if (performanceNow() - lastAvgCalculationTime >= avgCalculationInterval) {
			lastAvgCalculationTime = performanceNow();

			var physicsTimesSum = 0;

			for (var i = physicsTimes.length - 1; i >= 0; i--) {
				physicsTimesSum += physicsTimes[i];
			}

			console.log(performanceNow() + "," + physicsTimesSum);

			physicsTimes = [];
		}

		ENT.update(1);
		ENT.network();
		PHYS.clearQuadTree();
	}
} else {
	update = function() {
		PHYS.update(1);
		ENT.update(1);
		ENT.network();
		PHYS.clearQuadTree();
	}
}

setInterval(update, 1000 / 32);