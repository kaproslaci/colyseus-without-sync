"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var msgpack = require("msgpack-lite");
var Protocol;
(function (Protocol) {
    // Use codes between 0~127 for lesser throughput (1 byte)
    // User-related (1~10)
    Protocol[Protocol["USER_ID"] = 1] = "USER_ID";
    // Cluster messages (server-side)
    Protocol[Protocol["PASS_HTTP_SOCKET"] = 3] = "PASS_HTTP_SOCKET";
    Protocol[Protocol["PASS_WEBSOCKET"] = 4] = "PASS_WEBSOCKET";
    Protocol[Protocol["REQUEST_JOIN_ROOM"] = 8] = "REQUEST_JOIN_ROOM";
    Protocol[Protocol["CREATE_ROOM"] = 9] = "CREATE_ROOM";
    // Room-related (10~20)
    Protocol[Protocol["JOIN_ROOM"] = 10] = "JOIN_ROOM";
    Protocol[Protocol["JOIN_ERROR"] = 11] = "JOIN_ERROR";
    Protocol[Protocol["LEAVE_ROOM"] = 12] = "LEAVE_ROOM";
    Protocol[Protocol["ROOM_DATA"] = 13] = "ROOM_DATA";
    Protocol[Protocol["ROOM_STATE"] = 14] = "ROOM_STATE";
    Protocol[Protocol["ROOM_STATE_PATCH"] = 15] = "ROOM_STATE_PATCH";
    // Generic messages (50~60)
    Protocol[Protocol["BAD_REQUEST"] = 50] = "BAD_REQUEST";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
function send(client, message) {
    // [Protocol.JOIN_ERROR, roomId, err]
    client.send(msgpack.encode(message), { binary: true });
}
exports.send = send;
