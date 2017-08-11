var socket;

$(function() {
	connect();
});

function connect() {
	socket = io();

	socket.on("your id", function(id) {
		setLocalPlayerId(id);
	});

	socket.on("player position", function(data) {
		if (data.id == getLocalPlayerId()) {
			setLocalPlayerPosition(data.x, data.y, data.vx, data.vy);
		}
	});
}

function sendControl(control, down) {
	socket.emit("control " + (down ? "down" : "up"), control);
}

function sendAngle(angle) {
	socket.emit("my angle", angle);
}