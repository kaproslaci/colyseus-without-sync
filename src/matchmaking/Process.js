"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var msgpack = require("msgpack-lite");
var memshared = require("memshared");
var uws_1 = require("uws");
var Protocol_1 = require("../Protocol");
var Worker_1 = require("../cluster/Worker");
var Debug_1 = require("../Debug");
var app = new express();
var server = app.listen(0, "localhost");
var wss = new uws_1.Server({
    server: server,
    verifyClient: function (info, done) {
        // console.log("Verify client!", info, done);
        done(true);
    }
});
// setInterval(() => console.log("MatchMaking connections:", wss.clients.length), 1000);
wss.on('connection', onConnect);
//
// Listen to "redirect" messages from main process, to redirect the connection
// to match-making process.
//
var callbacks = {};
process.on('message', function (message, socket) {
    if (message[0] === Protocol_1.Protocol.PASS_WEBSOCKET) {
        Worker_1.handleUpgrade(server, socket, message);
        return;
    }
    else if (Array.isArray(message) && callbacks[message[0]]) {
        var callback = callbacks[message.shift()];
        callback.apply(void 0, message);
        return;
    }
});
// Process spawned successfully!
Debug_1.debugMatchMaking("MatchMaking process spawned with pid %d", process.pid);
function onConnect(client) {
    Worker_1.setUserId(client);
    client.on('message', function (message) {
        // try to decode message received from client
        try {
            message = msgpack.decode(Buffer.from(message));
        }
        catch (e) {
            console.error("Couldn't decode message:", message, e.stack);
            return;
        }
        if (message[0] !== Protocol_1.Protocol.JOIN_ROOM) {
            console.error("MatchMaking couldn't process message:", message);
            return;
        }
        var roomName = message[1];
        var joinOptions = message[2];
        // has room handler avaialble?
        memshared.lindex("handlers", roomName, function (err, index) {
            if (index === null) {
                Protocol_1.send(client, [Protocol_1.Protocol.JOIN_ERROR, roomName, "Error: no available handler for \"" + roomName + "\""]);
                return;
            }
            // Request to join an existing sessions for requested handler
            memshared.smembers(roomName, function (err, availableWorkerIds) {
                //
                // TODO:
                // remove a room from match-making cache when it reaches maxClients.
                //
                joinOptions.clientId = client.id;
                if (availableWorkerIds.length > 0) {
                    broadcastJoinRoomRequest(availableWorkerIds, client, roomName, joinOptions);
                }
                else {
                    // retrieve active worker ids
                    requestCreateRoom(client, roomName, joinOptions);
                }
            });
        });
    });
    client.on('error', function (e) {
        console.error("[ERROR]", client, e);
    });
}
function broadcastJoinRoomRequest(availableWorkerIds, client, roomName, joinOptions) {
    var responsesReceived = [];
    callbacks[client.id] = function (workerId, roomId, score) {
        responsesReceived.push({
            roomId: roomId,
            score: score,
            workerId: workerId
        });
        Debug_1.debugMatchMaking("JOIN_ROOM, receiving responses (%d/%d)", responsesReceived.length, availableWorkerIds.length);
        if (responsesReceived.length === availableWorkerIds.length) {
            // sort responses by score
            responsesReceived.sort(function (a, b) { return b.score - a.score; });
            var _a = responsesReceived[0], workerId_1 = _a.workerId, roomId_1 = _a.roomId, score_1 = _a.score;
            if (score_1 === 0) {
                Debug_1.debugMatchMaking("JOIN_ROOM, best score: %d, (options: %j)", score_1, joinOptions);
                // highest score is 0, let's request to create a room instead of joining.
                requestCreateRoom(client, roomName, joinOptions);
            }
            else {
                Debug_1.debugMatchMaking("JOIN_ROOM, best score: %d, (options: %j)", score_1, joinOptions);
                // send join room request to worker id with best score
                joinRoomRequest(workerId_1, client, roomId_1, joinOptions);
            }
        }
    };
    availableWorkerIds.forEach(function (availableWorkerId) {
        // Send JOIN_ROOM command to selected worker process.
        process.send([availableWorkerId, Protocol_1.Protocol.REQUEST_JOIN_ROOM, roomName, joinOptions]);
    });
}
function joinRoomRequest(workerId, client, roomName, joinOptions) {
    // forward data received from worker process to the client
    callbacks[client.id] = function (data) { return Protocol_1.send(client, data); };
    // Send JOIN_ROOM command to selected worker process.
    process.send([workerId, Protocol_1.Protocol.JOIN_ROOM, roomName, joinOptions]);
}
function requestCreateRoom(client, roomName, joinOptions) {
    // forward data received from worker process to the client
    callbacks[client.id] = function (data) { return Protocol_1.send(client, data); };
    memshared.lrange("workerIds", 0, -1, function (err, workerIds) {
        memshared.mget(workerIds, function (err, spawnedRoomCounts) {
            spawnedRoomCounts = spawnedRoomCounts.filter(function (count) { return count; });
            var selectedWorkerId = (spawnedRoomCounts.length > 0)
                ? workerIds[spawnedRoomCounts.indexOf(Math.min.apply(Math, spawnedRoomCounts))]
                : workerIds[0];
            Debug_1.debugMatchMaking("requesting CREATE_ROOM");
            // Send CREATE_ROOM command to selected worker process.
            process.send([selectedWorkerId, Protocol_1.Protocol.CREATE_ROOM, roomName, joinOptions]);
        });
    });
}
