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
var src_1 = require("../src");
var ChatRoom = /** @class */ (function (_super) {
    __extends(ChatRoom, _super);
    function ChatRoom() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChatRoom.prototype.onInit = function (options) {
        this.setState({ messages: [] });
    };
    ChatRoom.prototype.onJoin = function (client, options) {
        console.log("client has joined!", client, options);
        this.state.messages.push(client.id + " joined.");
    };
    ChatRoom.prototype.onLeave = function (client) {
        this.state.messages.push(client.id + " left.");
    };
    ChatRoom.prototype.onMessage = function (client, data) {
        this.state.messages.push(data.message);
        if (data.message === "leave") {
            this.disconnect();
        }
        console.log("ChatRoom:", client.id, data);
    };
    ChatRoom.prototype.onDispose = function () {
        console.log("Dispose ChatRoom");
    };
    return ChatRoom;
}(src_1.Room));
exports.ChatRoom = ChatRoom;
