"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var msgpack = require("msgpack-lite");
var Protocol_1 = require("../src/Protocol");
var mock_1 = require("./utils/mock");
describe('Room', function () {
    describe('#constructor', function () {
        it('should instantiate with valid options', function () {
            var room = new mock_1.DummyRoom();
            assert.ok(room instanceof mock_1.DummyRoom);
        });
        it('should instantiate with timeline attribute', function () {
            var room = new mock_1.DummyRoomWithTimeline();
            assert.equal(0, room.timeline.history.length);
        });
    });
    describe('#onJoin/#onLeave', function () {
        it('should receive onJoin/onLeave messages', function () {
            var room = new mock_1.DummyRoom();
            var client = mock_1.createDummyClient();
            var message = null;
            room._onJoin(client, {});
            assert.equal(client.messages.length, 1);
            message = msgpack.decode(client.messages[0]);
            assert.equal(message[0], Protocol_1.Protocol.JOIN_ROOM);
            room._onLeave(client);
            message = msgpack.decode(client.messages[1]);
            assert.equal(message[0], Protocol_1.Protocol.LEAVE_ROOM);
        });
        it('should receive JOIN_ROOM and ROOM_STATE messages onJoin', function () {
            var room = new mock_1.DummyRoomWithState();
            var client = mock_1.createDummyClient();
            var message = null;
            room._onJoin(client, {});
            assert.equal(client.messages.length, 2);
            message = msgpack.decode(client.messages[0]);
            assert.equal(message[0], Protocol_1.Protocol.JOIN_ROOM);
            message = msgpack.decode(client.messages[1]);
            assert.equal(message[0], Protocol_1.Protocol.ROOM_STATE);
        });
        it('should cleanup/dispose when all clients disconnect', function (done) {
            var room = new mock_1.DummyRoom();
            var client = mock_1.createDummyClient();
            room._onJoin(client);
            assert.equal(typeof (room._patchInterval._repeat), "number");
            room.on('dispose', function () {
                ;
                assert.equal(typeof (room._patchInterval._repeat), "object");
                done();
            });
            room._onLeave(client);
        });
    });
    describe('patch interval', function () {
        it('should set default "patch" interval', function () {
            var room = new mock_1.DummyRoom();
            assert.equal("object", typeof (room._patchInterval));
            assert.equal(1000 / 20, room._patchInterval._idleTimeout, "default patch rate should be 20");
        });
    });
    describe('#sendState', function () {
        it('should send state when it is set up', function () {
            var room = new mock_1.DummyRoom();
            var client = mock_1.createDummyClient();
            room._onJoin(client, {});
            room.setState({ success: true });
            // first message
            room.sendState(client);
            var message = msgpack.decode(client.messages[1]);
            assert.equal(message[0], Protocol_1.Protocol.ROOM_STATE);
            assert.deepEqual(message[2], { success: true });
        });
    });
    describe('#broadcastPatch', function () {
        it('should fail to broadcast patch without state', function () {
            var room = new mock_1.DummyRoom();
            // connect 2 dummy clients into room
            var client1 = mock_1.createDummyClient();
            room._onJoin(client1, {});
            var client2 = mock_1.createDummyClient();
            room._onJoin(client2, {});
            assert.equal(undefined, room.state);
            assert.throws(function () { room.broadcastPatch(); });
        });
        it('should broadcast patch having state', function () {
            var room = new mock_1.DummyRoom();
            // connect 2 dummy clients into room
            var client1 = mock_1.createDummyClient();
            room._onJoin(client1, {});
            var client2 = mock_1.createDummyClient();
            room._onJoin(client2, {});
            // set state
            room.setState({ one: 1 });
            assert.deepEqual({ one: 1 }, room.state);
            // clean state. no patches available!
            assert.equal(false, room.broadcastPatch());
            // change the state to make patch available
            room.state.one = 111;
            // voila!
            assert.equal(true, room.broadcastPatch());
        });
        it('shouldn\'t broadcast clean state (no patches)', function () {
            var room = new mock_1.DummyRoom();
            room.setState({ one: 1 });
            // create 2 dummy connections with the room
            var client = mock_1.createDummyClient();
            room._onJoin(client, {});
            var client2 = mock_1.createDummyClient();
            room._onJoin(client2, {});
            assert.deepEqual({ one: 1 }, room.state);
            // clean state. no patches available!
            assert.equal(false, room.broadcastPatch());
            // change the state to make patch available
            room.state.two = 2;
            assert.deepEqual({ one: 1, two: 2 }, room.state);
            // voila!
            assert.equal(true, room.broadcastPatch());
            assert.equal(client.messages.length, 3);
            assert.equal(client2.messages.length, 3);
            // first message, join room
            var message = msgpack.decode(client.messages[0]);
            assert.equal(message[0], Protocol_1.Protocol.JOIN_ROOM);
            // second message, room state
            var message = msgpack.decode(client.messages[1]);
            assert.equal(message[0], Protocol_1.Protocol.ROOM_STATE);
            // third message, empty patch state
            var message = msgpack.decode(client.messages[2]);
            assert.equal(message[0], Protocol_1.Protocol.ROOM_STATE_PATCH);
            assert.deepEqual(message[2].length, 22);
            assert.deepEqual(message[2], [66, 10, 66, 58, 130, 163, 111, 110, 101, 1, 163, 116, 119, 111, 2, 49, 86, 53, 49, 74, 89, 59]);
        });
    });
    describe("#disconnect", function () {
        it("should send disconnect message to all clients", function () {
            var room = new mock_1.DummyRoom();
            // connect 10 clients
            var lastClient;
            for (var i = 0, len = 10; i < len; i++) {
                lastClient = mock_1.createDummyClient();
                room._onJoin(lastClient, {});
            }
            assert.equal(lastClient.lastMessage[0], Protocol_1.Protocol.JOIN_ROOM);
            room.disconnect();
            assert.equal(lastClient.lastMessage[0], Protocol_1.Protocol.LEAVE_ROOM);
            assert.deepEqual(room.clients, {});
        });
        it("should send disconnect message to all clients", function (done) {
            var room = new mock_1.DummyRoom();
            // connect 10 clients
            var client1 = mock_1.createDummyClient();
            room._onJoin(client1, {});
            var client2 = mock_1.createDummyClient();
            room._onJoin(client2, {});
            var client3 = mock_1.createDummyClient();
            room._onJoin(client3, {});
            // force asynchronous
            setTimeout(function () { return room._onLeave(client1, true); }, 0);
            setTimeout(function () {
                assert.doesNotThrow(function () { return room.disconnect(); });
            }, 0);
            setTimeout(function () { return room._onLeave(client2, true); }, 0);
            setTimeout(function () { return room._onLeave(client3, true); }, 0);
            // fulfil the test
            setTimeout(done, 5);
        });
    });
});
