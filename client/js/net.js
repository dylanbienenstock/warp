var socket;

$(function() {
	connect();
});

function connect() {
	socket = io();

	socket.on("your id", function(id) {
		setPlayerId(id);
	});

	socket.on("player position", function(data) {
		if (data.id == getPlayerId()) {
			setPlayerPosition(data.x, data.y, data.vx, data.vy);
		}
	});
}

function sendControl(control, down) {
	socket.emit("control " + (down ? "down" : "up"), control);
}

function sendAngle(angle) {
	socket.emit("my angle", angle);
}