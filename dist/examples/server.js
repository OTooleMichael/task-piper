"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// content of index.js
var http_1 = __importDefault(require("http"));
var fs_1 = __importDefault(require("fs"));
var example_1 = require("./example");
var port = 3000;
var tm = null;
function serveFile(response) {
    fs_1.default.readFile(__dirname + '/index.html', 'UTF-8', function (err, str) {
        response.end(str);
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    tm = example_1.makeTask();
                    tm.on('progress', function (task) {
                        console.log(task.runId, task.name, task.result);
                    });
                    return [4 /*yield*/, tm.runTask(example_1.RouteExample, {})];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.log(error_1, 'ERROR OUT');
                    tm = null;
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getData(tree) {
    var nodes = [tree];
    var node = tree;
    var edges = [];
    while (node && node.next()) {
        node = node.next();
        nodes.push(node);
    }
    nodes.sort(function (a, b) { return a.depth > b.depth ? -1 : 1; });
    var nodesData = nodes.map(function (node) {
        var status = node.data._status();
        edges = node.edges.map(function (e) {
            return { to: e.parentId, from: e.childId };
        }).concat(edges);
        var tier = node.distanceFromLeaf();
        var colors = {
            'PENDING': 'orange',
            'RUN': 'green',
            'RUNNING': 'lightblue',
            'IS_ALREADY_COMPLETE': 'green',
        };
        return {
            id: node.id,
            label: node.name + '\nDEPTH:' + node.depth + '\n' + status + '\nRUN: ' + tier,
            name: node.name,
            status: status,
            tier: tier,
            depth: node.depth,
            color: colors[status] || 'grey'
        };
    });
    return {
        id: tree.data.runId,
        nodes: nodesData,
        edges: edges
    };
}
var requestHandler = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var url, method, data_1;
    return __generator(this, function (_a) {
        url = request.url, method = request.method;
        if (!tm) {
            start();
        }
        if (method === 'GET' && url == '/') {
            serveFile(response);
            return [2 /*return*/];
        }
        if (url == '/data') {
            try {
                data_1 = getData(tm.routeNode);
                response.end(JSON.stringify(data_1, null, 2));
                return [2 /*return*/];
            }
            catch (error) {
                console.log(error);
                response.end('{}');
                return [2 /*return*/];
            }
        }
        response.end('');
        return [2 /*return*/];
    });
}); };
var server = http_1.default.createServer(requestHandler);
server.listen(port, function () {
    console.log("server is listening on " + port);
});
