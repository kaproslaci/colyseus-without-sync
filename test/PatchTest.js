"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var msgpack = require("msgpack-lite");
var mock_1 = require("./utils/mock");
var Protocol_1 = require("../src/Protocol");
describe('Patch', function () {
    var room;
    beforeEach(function () {
        room = new mock_1.DummyRoom();
    });
    describe('patch interval', function () {
        var room = new mock_1.DummyRoom();
        room.setPatchRate(1000 / 20);
        assert.equal("object", typeof (room._patchInterval));
        assert.equal(1000 / 20, room._patchInterval._idleTimeout, "should have patch rate set");
    });
    describe('simulation interval', function () {
        it('simulation shouldn\'t be initialized by default', function () {
            assert.equal(typeof (room._simulationInterval), "undefined");
        });
        it('allow setting simulation interval', function () {
            room.setSimulationInterval(function () { }, 1000 / 60);
            assert.equal("object", typeof (room._simulationInterval));
            assert.equal(1000 / 60, room._simulationInterval._idleTimeout);
        });
    });
    describe('#sendState', function () {
        it('should allow null and undefined values', function () {
            var room = new mock_1.DummyRoom();
            var client = mock_1.createDummyClient();
            room.setState({ n: null, u: undefined });
            room._onJoin(client, {});
            var message = msgpack.decode(client.messages[1]);
            assert.equal(message[0], Protocol_1.Protocol.ROOM_STATE);
            assert.deepEqual(message[2], { n: null, u: null });
        });
    });
});
