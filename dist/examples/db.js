"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var ndjson_1 = __importDefault(require("ndjson"));
var FILE = './db.json';
function write(payload) {
    var logLine = JSON.stringify(payload);
    return new Promise(function (resolve, reject) {
        fs_1.default.appendFile(FILE, logLine + '\n', function (err) {
            return err ? reject(err) : resolve();
        });
    });
}
function find(params) {
    var match = params.match, limit = params.limit;
    var stream = fs_1.default.createReadStream(FILE, { encoding: 'utf8' });
    var values = [];
    stream = stream.pipe(ndjson_1.default.parse());
    return new Promise(function (resolve, reject) {
        stream.on('error', function (e) {
            return reject(e);
        }).on('data', function (obj) {
            if (limit && values.length >= limit) {
                return;
            }
            var isMatch = match(obj);
            if (isMatch) {
                values.push(obj);
            }
        }).on('finish', function () {
            return resolve(values);
        });
    });
}
exports.default = {
    find: find, write: write
};
