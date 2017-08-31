"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var shortid = require("shortid");
var msgpack = require("msgpack-lite");
var Room_1 = require("../../src/Room");
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(id) {
        var _this = _super.call(this) || this;
        _this.messages = [];
        _this.id = id || null;
        return _this;
    }
    Client.prototype.send = function (message) {
        this.messages.push(message);
    };
    Object.defineProperty(Client.prototype, "lastMessage", {
        get: function () {
            return msgpack.decode(this.messages[this.messages.length - 1]);
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.close = function () {
        this.messages = [];
        // this.emit('close');
    };
    return Client;
}(events_1.EventEmitter));
exports.Client = Client;
function createEmptyClient() {
    return new Client();
}
exports.createEmptyClient = createEmptyClient;
function createDummyClient() {
    return new Client(shortid.generate());
}
exports.createDummyClient = createDummyClient;
var DummyRoom = /** @class */ (function (_super) {
    __extends(DummyRoom, _super);
    function DummyRoom() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DummyRoom.prototype.requestJoin = function (options) {
        return !options.invalid_param;
    };
    DummyRoom.prototype.onInit = function () { };
    DummyRoom.prototype.onDispose = function () { };
    DummyRoom.prototype.onJoin = function () { };
    DummyRoom.prototype.onLeave = function () { };
    DummyRoom.prototype.onMessage = function () { };
    return DummyRoom;
}(Room_1.Room));
exports.DummyRoom = DummyRoom;
var RoomWithError = /** @class */ (function (_super) {
    __extends(RoomWithError, _super);
    function RoomWithError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RoomWithError.prototype.onInit = function () { };
    RoomWithError.prototype.onDispose = function () { };
    RoomWithError.prototype.onJoin = function () {
        this.iHaveAnError();
    };
    RoomWithError.prototype.onLeave = function () { };
    RoomWithError.prototype.onMessage = function () { };
    return RoomWithError;
}(Room_1.Room));
exports.RoomWithError = RoomWithError;
var DummyRoomWithState = /** @class */ (function (_super) {
    __extends(DummyRoomWithState, _super);
    function DummyRoomWithState() {
        var _this = _super.call(this) || this;
        _this.setState({ number: 10 });
        return _this;
    }
    DummyRoomWithState.prototype.requestJoin = function (options) {
        return !options.invalid_param;
    };
    DummyRoomWithState.prototype.onInit = function () { };
    DummyRoomWithState.prototype.onDispose = function () { };
    DummyRoomWithState.prototype.onJoin = function () { };
    DummyRoomWithState.prototype.onLeave = function () { };
    DummyRoomWithState.prototype.onMessage = function () { };
    return DummyRoomWithState;
}(Room_1.Room));
exports.DummyRoomWithState = DummyRoomWithState;
var DummyRoomWithTimeline = /** @class */ (function (_super) {
    __extends(DummyRoomWithTimeline, _super);
    function DummyRoomWithTimeline() {
        var _this = _super.call(this) || this;
        _this.useTimeline();
        return _this;
    }
    DummyRoomWithTimeline.prototype.requestJoin = function (options) {
        return !options.invalid_param;
    };
    DummyRoomWithTimeline.prototype.onInit = function () { };
    DummyRoomWithTimeline.prototype.onDispose = function () { };
    DummyRoomWithTimeline.prototype.onJoin = function () { };
    DummyRoomWithTimeline.prototype.onLeave = function () { };
    DummyRoomWithTimeline.prototype.onMessage = function () { };
    return DummyRoomWithTimeline;
}(Room_1.Room));
exports.DummyRoomWithTimeline = DummyRoomWithTimeline;
