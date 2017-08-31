"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var MatchMaker_1 = require("../src/MatchMaker");
var Room_1 = require("../src/Room");
var mock_1 = require("./utils/mock");
describe('MatchMaker', function () {
    var matchMaker;
    before(function () {
        matchMaker = new MatchMaker_1.MatchMaker();
        matchMaker.addHandler('room', mock_1.DummyRoom);
        matchMaker.addHandler('dummy_room', mock_1.DummyRoom);
    });
    describe('room handlers', function () {
        it('should add handler with name', function () {
            assert.equal(mock_1.DummyRoom, matchMaker.handlers.room[0]);
            assert.equal(0, Object.keys(matchMaker.handlers.room[1]).length);
            assert.equal(false, matchMaker.hasAvailableRoom('room'));
        });
        it('should create a new room on joinOrCreateByName', function (done) {
            matchMaker.onJoinRoomRequest('room', {}, true, function (err, room) {
                assert.ok(typeof (room.roomId) === "string");
                assert.ok(room instanceof Room_1.Room);
                done();
            });
        });
        it('shouldn\'t return when trying to join with invalid room id', function () {
            assert.equal(matchMaker.joinById('invalid_id', {}), undefined);
        });
        it('shouldn\'t create room when requesting to join room with invalid params', function (done) {
            matchMaker.onJoinRoomRequest('dummy_room', { invalid_param: 10 }, true, function (err, room) {
                assert.ok(typeof (err) === "string");
                assert.equal(room, undefined);
                done();
            });
        });
        it('shouldn\t return room instance when trying to join existing room by id with invalid params', function (done) {
            matchMaker.onJoinRoomRequest('room', {}, true, function (err, room) {
                assert.ok(room instanceof Room_1.Room);
                assert.equal(matchMaker.joinById(room.roomId, { invalid_param: 1 }), undefined);
                done();
            });
        });
        it('should join existing room using "joinById"', function (done) {
            assert.equal(false, matchMaker.hasAvailableRoom('dummy_room'));
            matchMaker.onJoinRoomRequest('dummy_room', {}, true, function (err, room) {
                var joiningRoom = matchMaker.joinById(room.roomId, {});
                assert.equal(true, matchMaker.hasAvailableRoom('dummy_room'));
                assert.equal('dummy_room', room.roomName);
                assert.equal(room.roomId, joiningRoom.roomId);
                done();
            });
        });
    });
});
