'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var gsid = exports.gsid = function gsid() {
    return 'xxyxx-xxxx-yxxx-yxxx-'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    }) + Date.now();
};

var pick = exports.pick = function pick(obj, keys) {
    keys = keys || Object.keys(obj);
    var result = {};
    keys.reduce(function (preV, curV, index) {
        result[curV] = obj[curV];
        return result;
    }, result);
    return result;
};