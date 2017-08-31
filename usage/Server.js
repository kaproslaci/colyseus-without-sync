"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var express = require("express");
var Server_1 = require("../src/Server");
var ChatRoom_1 = require("./ChatRoom");
var port = 8080;
var endpoint = "localhost";
var app = express();
// Create HTTP & WebSocket servers
var server = http.createServer(app);
var gameServer = new Server_1.Server({ server: server });
// Register ChatRoom as "chat"
gameServer.register("chat", ChatRoom_1.ChatRoom);
app.use(express.static(__dirname));
app.get("/something", function (req, res) {
    console.log("something!", process.pid);
    res.send("Hey!");
});
gameServer.listen(port);
console.log("Listening on http://" + endpoint + ":" + port);
