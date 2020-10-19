"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const ndjson_1 = __importDefault(require("ndjson"));
const FILE = './db.json';
function clear() {
    return fs_1.default.promises.writeFile(FILE, '');
}
function write(payload) {
    const logLine = JSON.stringify(payload);
    return fs_1.default.promises.appendFile(FILE, logLine + '\n');
}
function find(params) {
    const { match, limit } = params;
    let stream = fs_1.default.createReadStream(FILE, { encoding: 'utf8' });
    const values = [];
    stream = stream.pipe(ndjson_1.default.parse());
    return new Promise(function (resolve, reject) {
        stream.on('error', function (e) {
            return reject(e);
        }).on('data', function (obj) {
            if (limit && values.length >= limit) {
                return;
            }
            const isMatch = match(obj);
            if (isMatch) {
                values.push(obj);
            }
        }).on('finish', function () {
            return resolve(values);
        });
    });
}
exports.default = {
    find, write, clear
};
