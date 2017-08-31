"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var Utils_1 = require("../src/Utils");
describe('Utils', function () {
    describe('toJSON', function () {
        var obj = {
            num: 1,
            str: "hello world",
            float: 1.1,
            func: function () { },
            nested: {
                num: 1,
                str: "hello world",
                float: 1.1,
                func: function () { }
            }
        };
        it("shouldn't copy functions into the result", function () {
            assert.deepEqual(Utils_1.toJSON(obj), {
                num: 1,
                str: "hello world",
                float: 1.1,
                nested: {
                    num: 1,
                    str: "hello world",
                    float: 1.1
                }
            });
        });
    });
});
