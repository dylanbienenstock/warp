var express = require("express");
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

const physicsDebug = process.env.PHYS_DEBUG;

var PHYS = require("./physics/PhysicsManager.js")(io, physicsDebug);
var Physics = require("./physics/Physics.js")(PHYS);
PHYS.Physics = Physics;

var ENT = require("./entity/EntityManager.js")(io, physicsDebug);
var Entity = require("./entity/Entity.js")(io, ENT, PHYS);
ENT.Entity = Entity;

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
}

function onConnect(socket) {
	var accepted = false;

	socket.on("name request", function(name) {
		if (!accepted) {
			var response = processName(name);
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

	var player = ENT.new("Player", {
		name: name,
		x: -Math.cos(angle) * 145,
		y: -Math.sin(angle) * 145
	});

	ENT.create(player, socket); 

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

function setupGame() {
	for (var i = 0; i < 6; i++) {
		var angle = 2 * Math.PI * Math.random();

		ENT.create(ENT.new("Planet", {
			x: -Math.cos(angle) * (PHYS.boundaryRadius / 2 + Math.random() * 512),
			y: -Math.sin(angle) * (PHYS.boundaryRadius / 2 + Math.random() * 512),
			radius: Math.random() * 32 + 32
		}));
	}

	ENT.create(ENT.new("Shield", {
		radius: 256,
		hitSize: 100
	}));
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
	}
} else {
	update = function() {
		PHYS.update(1);
		ENT.update(1);
		ENT.network();
	}
}

setInterval(update, 1000 / 32);