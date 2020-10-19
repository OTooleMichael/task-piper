"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// content of index.js
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const example_1 = __importDefault(require("./example"));
const db_1 = __importDefault(require("./db"));
const port = 3000;
function serveFile(response) {
    fs_1.default.readFile(__dirname + '/index.html', 'UTF-8', function (err, str) {
        response.end(str);
    });
}
const TASK_NAME = 'RouteExample';
async function start() {
    console.log('START');
    function logProgress(task) {
        console.log('Progress:', task.runId, task.name, task.result);
    }
    try {
        example_1.default.on('progress', logProgress);
        const res = await example_1.default.runTask(TASK_NAME);
        console.log(res);
    }
    catch (error) {
        console.log(error, 'ERROR OUT');
    }
    finally {
        example_1.default.off('progress', logProgress);
    }
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
const requestHandler = async (request, response) => {
    const { url, method } = request;
    if (method === 'GET' && url == '/') {
        serveFile(response);
        return;
    }
    switch (url) {
        case '/data': {
            try {
                const tm = example_1.default.getTaskRun(TASK_NAME);
                const node = tm ? tm.routeNode : undefined;
                const data = node ? getData(node) : {};
                response.end(JSON.stringify(data, null, 2));
                return;
            }
            catch (error) {
                console.log(error);
                response.end('{}');
                return;
            }
        }
        case '/reset': {
            await db_1.default.clear();
            break;
        }
        case '/start': {
            if (!example_1.default.getRunning(TASK_NAME)) {
                start();
            }
            break;
        }
    }
    response.end('{}');
};
const server = http_1.default.createServer(requestHandler);
server.listen(port, () => {
    console.log(`server is listening on ${port}`);
});
