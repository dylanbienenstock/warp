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
		console.log("asdasd")
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

setInterval(update, 1000 / 8);

var speed = 10;

function update() {
	for (playerSocketId in players) {
		if (players.hasOwnProperty(playerSocketId)) {
			var player = players[playerSocketId];

			if (player.controls.thrustForward) {
				player.x += -Math.cos(player.angle) * speed;
				player.y += -Math.sin(player.angle) * speed;
			}

			sendPlayerPosition(player);
		}
	}
}