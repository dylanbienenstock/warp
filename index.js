var express = require("express");
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

const physicsDebug = process.env.PHYS_DEBUG;

var PHYS = require("./physics/PhysicsManager.js")(io);
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
	ENT.sendAllEntities(socket);

	var angle = 2 * Math.PI * Math.random();

	var player = ENT.new("Player", {
		x: -Math.cos(angle) * 145,
		y: -Math.sin(angle) * 145
	});

	ENT.create(player, socket); 

	if (!physicsDebug) {
		console.log("+ Player connected. (ID: " + player.id + ")");
	}

	socket.on("disconnect", function() {
		if (!physicsDebug) {
			console.log("- Player disconnected. (ID: " + player.id + ")");
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