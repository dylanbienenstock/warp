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

	console.log("+ Player connected. (ID: " + player.id + ")");

	socket.on("disconnect", function() {
		console.log("- Player disconnected. (ID: " + player.id + ")");

		ENT.remove(player);
	});

	socket.on("control down", function(control) {
		player.controls[control] = true;
	});

	socket.on("control up", function(control) {
		player.controls[control] = false;
	});

	socket.on("angle", function(angle) {
		if (player.alive) {
			player.physicsObject.rotation = angle;
		}
	});
}

/////////////////////////////////// GAME CODE ///////////////////////////////////

function setupGame() {
	ENT.create(ENT.new("Shield", {
		radius: 256,
		hitSize: 100
	}));
}

setInterval(function() {
	PHYS.update(1);
	ENT.update(1);
	ENT.network();
}, 1000 / 32);