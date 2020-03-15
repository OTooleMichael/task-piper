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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// content of index.js
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const example_1 = require("./example");
const port = 3000;
let tm = null;
function serveFile(response) {
    fs_1.default.readFile(__dirname + '/index.html', 'UTF-8', function (err, str) {
        response.end(str);
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tm = example_1.makeTask();
            tm.on('progress', function (task) {
                console.log(task.runId, task.name, task.result);
            });
            yield tm.runTask(example_1.RouteExample, {});
        }
        catch (error) {
            console.log(error, 'ERROR OUT');
            tm = null;
        }
    });
}
function getData(tree) {
    const nodes = [tree];
    let node = tree;
    let edges = [];
    while (node && node.next()) {
        node = node.next();
        nodes.push(node);
    }
    nodes.sort((a, b) => a.depth > b.depth ? -1 : 1);
    const nodesData = nodes.map(function (node) {
        const status = node.data._status();
        edges = node.edges.map(e => {
            return { to: e.parentId, from: e.childId };
        }).concat(edges);
        const tier = node.distanceFromLeaf();
        const colors = {
            'PENDING': 'orange',
            'RUN': 'green',
            'RUNNING': 'lightblue',
            'IS_ALREADY_COMPLETE': 'green',
        };
        return {
            id: node.id,
            label: node.name + '\nDEPTH:' + node.depth + '\n' + status + '\nRUN: ' + tier,
            name: node.name,
            status,
            tier,
            depth: node.depth,
            color: colors[status] || 'grey'
        };
    });
    return {
        id: tree.data.runId,
        nodes: nodesData,
        edges
    };
}
const requestHandler = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, method } = request;
    if (!tm) {
        start();
    }
    if (method === 'GET' && url == '/') {
        serveFile(response);
        return;
    }
    if (url == '/data') {
        try {
            const data = getData(tm.routeNode);
            response.end(JSON.stringify(data, null, 2));
            return;
        }
        catch (error) {
            console.log(error);
            response.end('{}');
            return;
        }
    }
    response.end('');
});
const server = http_1.default.createServer(requestHandler);
server.listen(port, () => {
    console.log(`server is listening on ${port}`);
});
