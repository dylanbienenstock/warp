var express = require("express");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set("port", (process.env.PORT || 8080));

app.use(express.static("./client"));

app.get("/", function(req, res){
  res.sendFile("./client/index.html");
});

io.on("connection", onConnect);

http.listen(app.get("port"), function(){
  console.log("Server listening on port " + app.get("port"));
});

/*

/!\ PACKET FORMATS /!\
(client to server: ->, server to client: <-)
-------------------------------------------- 

-> "control down" - string: control
X -> "control up" -  string: control
X -> "my angle" - number: angle
<- "your id" - number: id
<- "player position" - { number: x, number: y, number: vx, number: vy }

*/

function onConnect(socket) {
	console.log("Player connected.")

	createPlayer(socket);
	var player = players[socket.id];

	socket.emit("your id", player.id);

	socket.on("control down", function(control) {
		player.controls[control] = true;
	});

	socket.on("control up", function(control) {
		player.controls[control] = false;
	});

	socket.on("my angle", function(angle) {
		player.angle = angle;
	});
}

function sendPlayerPosition(player) {
	io.emit("player position", {
		id: player.id,
		x: player.x,
		y: player.y,
		vx: player.vx,
		vy: player.vy
	});
}

/////////////////////////////////// GAME CODE ///////////////////////////////////

var players = {};
var nextId = 0;

function createPlayer(socket) {
	players[socket.id] = {
		id: nextId,
		socketid: socket.id,
		controls: {
			thrustForward: false,
			thrustBackward: false,
			thrustLeft: false,
			thrustRight: false
		},
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		angle: 0
	};

	nextId++;
}
  
setInterval(update, 1000 / 64);
setInterval(networkUpdates, 1000 / 32);

var speed = 3;

function update() {
	for (playerSocketId in players) {
		if (players.hasOwnProperty(playerSocketId)) {
			var player = players[playerSocketId];
			var degToRad = Math.PI / 180;

			if (player.angle > 180 * degToRad) {
				degToRad *= -1;
			}

			if (player.controls.thrustForward) {
				player.x += -Math.cos(player.angle) * speed;
				player.y += -Math.sin(player.angle) * speed;
			}

			if (player.controls.thrustBackward) {
				player.x -= -Math.cos(player.angle) * speed;
				player.y -= -Math.sin(player.angle) * speed;
			}

			if (player.controls.thrustLeft) {
				player.x += -Math.cos(player.angle - 90 * degToRad) * speed;
				player.y += -Math.sin(player.angle - 90 * degToRad) * speed;
			}

			if (player.controls.thrustRight) {
				player.x += -Math.cos(player.angle + 90 * degToRad) * speed;
				player.y += -Math.sin(player.angle + 90 * degToRad) * speed;
			}
		}
	}
}

function networkUpdates() {
	for (playerSocketId in players) {
		if (players.hasOwnProperty(playerSocketId)) {
			var player = players[playerSocketId];

			sendPlayerPosition(player);
		}
	}
}