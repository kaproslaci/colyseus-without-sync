"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cluster = require("cluster");
var express = require("express");
var ClusterServer_1 = require("../src/ClusterServer");
var ChatRoom_1 = require("./ChatRoom");
var gameServer = new ClusterServer_1.ClusterServer();
// Register ChatRoom as "chat"
gameServer.register("chat", ChatRoom_1.ChatRoom);
if (cluster.isMaster) {
    gameServer.listen(8080);
}
else {
    console.log("Worker spawned", process.pid);
    var app = new express();
    app.get("/something", function (req, res) {
        console.log("something!", process.pid);
        res.send("Hey!");
    });
    // Create HTTP Server
    gameServer.attach({ server: app });
}
