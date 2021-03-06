"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cluster = require("cluster");
var memshared = require("memshared");
var child_process = require("child_process");
var os = require("os");
var ip = require("ip");
var Utils_1 = require("../Utils");
var seed = (Math.random() * 0xffffffff) | 0;
var workers = [];
function getNextWorkerForSocket(socket) {
    var hash = getHash(ip.toBuffer(socket.remoteAddress || '127.0.0.1'));
    return workers[hash % workers.length];
}
exports.getNextWorkerForSocket = getNextWorkerForSocket;
function spawnWorkers(options) {
    if (options === void 0) { options = {}; }
    // use the number of CPUs as number of workers.
    if (!options.numWorkers) {
        options.numWorkers = os.cpus().length;
    }
    for (var i = 0, len = options.numWorkers; i < len; i++) {
        spawnWorker();
    }
}
exports.spawnWorkers = spawnWorkers;
function spawnMatchMaking() {
    var worker = child_process.fork(__dirname + "/../matchmaking/Process", [], { silent: false });
    enableProcessCommunication(worker);
    // allow worker to use memshared
    memshared.registerProcess(worker);
    return worker;
}
exports.spawnMatchMaking = spawnMatchMaking;
function spawnWorker() {
    var worker = cluster.fork();
    if (!memshared.store['workerIds']) {
        memshared.store['workerIds'] = [];
    }
    // push worker id to shared workers list.
    memshared.store['workerIds'].push(worker.process.pid);
    // push worker to workers list
    workers.push(worker);
    enableProcessCommunication(worker);
    // auto-spawn a new worker on failure
    worker.on("exit", function () {
        console.warn("worker", process.pid, "died. Respawn.");
        // remove workerId from shared store
        Utils_1.spliceOne(memshared.store['workerIds'], memshared.store['workerIds'].indexOf(process.pid));
        // remove worker from workers list.
        Utils_1.spliceOne(workers, workers.indexOf(worker));
        // spawn new worker as a replacement for this one
        spawnWorker();
    });
    return worker;
}
exports.spawnWorker = spawnWorker;
function enableProcessCommunication(worker) {
    worker.on("message", function (message) {
        var workerProcess = Array.isArray(message) && memshared.getProcessById(message.shift());
        if (workerProcess) {
            workerProcess.send(message);
        }
    });
}
/**
 */
function getHash(ip) {
    var hash = seed;
    for (var i = 0; i < ip.length; i++) {
        var num = ip[i];
        hash += num;
        hash %= 2147483648;
        hash += (hash << 10);
        hash %= 2147483648;
        hash ^= hash >> 6;
    }
    hash += hash << 3;
    hash %= 2147483648;
    hash ^= hash >> 11;
    hash += hash << 15;
    hash %= 2147483648;
    return hash >>> 0;
}
