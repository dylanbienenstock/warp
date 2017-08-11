var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set("port", (process.env.PORT || 8080));

app.use(express.static("./client"));

app.get("/", function(req, res){
  res.sendFile("./client/index.html");
});

io.on("connection", onConnect);

http.listen(3000, function(){
  console.log("Server listening on port " + app.get("port"));
});

function onConnect(socket) {

}