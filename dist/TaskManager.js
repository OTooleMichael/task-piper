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
const events_1 = require("events");
const types_1 = require("./types");
const Task_1 = __importDefault(require("./Task"));
const Node_1 = __importDefault(require("./Node"));
function validateTaskInst(inst) {
    if (!(inst instanceof Task_1.default)) {
        throw new Error('Is Not an instanceof Task Class');
    }
    if (!inst.name) {
        throw new Error('this.name must be defined for All Task Instances');
    }
    const requiredMethods = ['isComplete', 'log'];
    for (const m of requiredMethods) {
        if (typeof inst[m] !== 'function') {
            throw new Error(m + ' is a required Method of ' + inst.name);
        }
    }
}
class CircularDependencyError extends Error {
    constructor(message, dependencyPath) {
        super(message);
        this.dependencyPath = dependencyPath;
    }
}
function createRunningOrder(treeRoot) {
    const nodes = [];
    treeRoot.traverse(function (node) {
        node.tier = node.distanceFromLeaf();
        nodes.push(node);
    });
    nodes.sort(function (a, b) {
        return (a.tier || 0) > (b.tier || 0) ? 1 : -1;
    });
    const inList = {};
    let currentTier = undefined;
    const list = [];
    nodes.forEach(function (node) {
        if (node.tier !== currentTier) {
            currentTier = node.tier;
            list.push([]);
        }
        if (inList[node.name]) {
            node.data.result = 'NOT_TO_BE_RUN';
            return;
        }
        inList[node.name] = true;
        node.data.tier = currentTier;
        const myTier = list.pop();
        if (!myTier) {
            return;
        }
        myTier.push(node);
        list.push(myTier);
    });
    return {
        nodes,
        list
    };
}
class TaskManager extends events_1.EventEmitter {
    constructor(globalOptions) {
        super();
        this.globalOptions = globalOptions || {};
        this.taskRegistry = {};
        this.nodesList = [];
        this.runOrder = [];
        return this;
    }
    runTaskSetUp(TaskClass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.runTime = new Date();
            const minTaskOptions = { options, depth: 0 };
            const task = this.task = this.instanciateChild(TaskClass, minTaskOptions);
            if (!task) {
                throw new Error('.task not found');
            }
            this.runId = task.runId;
            const routeNode = yield this.makeTree({ task, parent: undefined });
            this.routeNode = routeNode;
            const { nodes, list } = createRunningOrder(routeNode);
            this.nodesList = nodes;
            this.runOrder = list;
            return this;
        });
    }
    runTask(TaskClass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.runTaskSetUp(TaskClass, options);
            return this._runTask();
        });
    }
    _runTask() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let results = [];
                for (const tier of this.runOrder) {
                    // group all tasks that can run at the same tier
                    const res = yield Promise.all(tier.map((node) => __awaiter(this, void 0, void 0, function* () {
                        const result = yield node.data._run();
                        this.emit('progress', node.data);
                        return result;
                    })));
                    results = results.concat(res);
                }
                this.emit('complete', results);
                return results;
            }
            catch (error) {
                if (this._events.error) {
                    this.emit('error', error);
                }
                throw error;
            }
        });
    }
    makeTree({ task, parent }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = task;
            if (!name) {
                throw new Error('.name is Required');
            }
            const oldTask = this.taskRegistry[name];
            if (!oldTask) {
                this.taskRegistry[name] = task;
            }
            const parentNode = parent ? parent.node : null;
            const node = new Node_1.default(task, parentNode);
            if (node.isCircular) {
                const dependencyPath = node.path.map(n => n.name).concat(name);
                throw new CircularDependencyError('Circular Dependency: ' + name, dependencyPath);
            }
            task.node = node;
            if (parentNode) {
                parentNode.addChildNode(node);
            }
            const isComplete = oldTask ? oldTask.isCompleted : yield task._isComplete();
            node.status = types_1.ResultState.PENDING;
            if (isComplete) {
                node.status = types_1.ResultState.IS_ALREADY_COMPLETE;
                task.result = types_1.ResultState.IS_ALREADY_COMPLETE;
                if (!this.globalOptions.fullDepth) {
                    return node;
                }
            }
            const requires = task._requiredTasks = yield task._requires();
            for (const TaskClass of requires) {
                const inst = this.instanciateChild(TaskClass, task);
                yield this.makeTree({ task: inst, parent: task });
            }
            return node;
        });
    }
    instanciateChild(TaskClass, parentInst) {
        const { options, depth = 0 } = parentInst;
        const opts = Object.assign({ taskManager: this, runTime: this.runTime }, options, { depth: depth + 1 });
        const inst = new TaskClass(opts);
        validateTaskInst(inst);
        return inst;
    }
    static runOneTask(TaskClass, options) {
        const tm = new TaskManager(options);
        return tm.runTask(TaskClass, options);
    }
}
exports.default = TaskManager;
