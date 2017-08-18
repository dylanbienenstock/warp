var express = require("express");
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var PHYS = require("./physics/PhysicsManager.js")(io);
var ENT = require("./entity/EntityManager.js")(io, PHYS);
var Entity = require("./entity/Entity.js")(io, ENT, PHYS);

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
-> "control up" -  string: control
-> "my angle" - number: angle
<- "entity create" - {} // Contains all properties of created entity
<- "entity set" - {} 	// Contains id and properties to update 
<- "entity set position" - { number: id, number: x, number: y }

*/

function onConnect(socket) {
	ENT.sendAllEntities(socket);

	var player = new Entity.Player();
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
		player.angle = angle;
	});
}

/////////////////////////////////// GAME CODE ///////////////////////////////////
  
setInterval(update, 1000 / 64);
setInterval(network, 1000 / 32);

function update() {
	ENT.update();
}

function network() {
	ENT.network();
}