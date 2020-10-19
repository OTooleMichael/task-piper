"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Task_1 = __importDefault(require("./Task"));
const TaskManager_1 = __importDefault(require("./TaskManager"));
const SharedWaiting_1 = __importDefault(require("./SharedWaiting"));
function getTaskName(TaskClass) {
    const inst = new TaskClass();
    if (!inst.name) {
        throw new Error('Name not found');
    }
    return inst.name;
}
exports.getTaskName = getTaskName;
function isSubClass(TaskClass) {
    if (TaskClass === Task_1.default) {
        return true;
    }
    try {
        const task = new TaskClass();
        if (task instanceof Task_1.default) {
            return true;
        }
    }
    catch (error) {
        console.log(TaskClass);
        console.log(error);
    }
    return false;
}
exports.isSubClass = isSubClass;
class Registry extends events_1.EventEmitter {
    constructor() {
        super();
        this.tasks = {};
        this.awaitableNodes = {};
        this.runningTasks = {};
        this.recentlyFinished = {};
        this.cleanupTimeout = 1000 * 10;
        this.tasks = {};
        this.awaitableNodes = {};
        this.runningTasks = {};
    }
    purgeAwaitables() {
        for (const key in this.awaitableNodes) {
            const awaitable = this.awaitableNodes[key];
            if (!awaitable.active) {
                delete this.awaitableNodes[key];
            }
        }
    }
    list() {
        return Object.keys(this.tasks);
    }
    add(TaskClass) {
        if (!isSubClass(TaskClass)) {
            throw new Error('Registry.add must be provided a Task Class');
        }
        const name = getTaskName(TaskClass);
        if (!name) {
            throw new Error('"name" is a required Field');
        }
        if (this.get(name)) {
            throw new Error('Task is already registered: ' + name);
        }
        this.tasks[name] = TaskClass;
        return this;
    }
    create(payload, SuperClass = Task_1.default) {
        if (typeof payload === 'function') {
            return this.add(payload);
        }
        const TaskClass = SuperClass.createTask(payload);
        return this.add(TaskClass);
    }
    get(name) {
        return this.tasks[name];
    }
    getRunning(name) {
        return this.runningTasks[name];
    }
    getTaskRun(name) {
        return this.getRunning(name) || this.recentlyFinished[name];
    }
    _cleanupRunning(name) {
        const task = this.runningTasks[name];
        if (!task) {
            return this;
        }
        this.recentlyFinished[name] = task;
        delete this.runningTasks[name];
        setTimeout(() => {
            delete this.recentlyFinished[name];
        }, this.cleanupTimeout);
        return this;
    }
    async runTask(nameOrClass, options = {}) {
        let name = '__dummyKey__';
        try {
            name = await this.initTaskManager(nameOrClass, options);
            const tm = this.getRunning(name);
            if (!tm) {
                throw new Error('Manager not Init ' + name);
            }
            const res = await tm._runTask();
            return res;
        }
        finally {
            this._cleanupRunning(name);
            this.purgeAwaitables();
        }
    }
    async initTaskManager(nameOrClass, options = {}) {
        if (!nameOrClass) {
            throw new Error('nameOrClass is Required');
        }
        let TaskClass = null;
        if (typeof nameOrClass === 'string') {
            TaskClass = this.get(nameOrClass);
        }
        else {
            TaskClass = nameOrClass;
        }
        if (!TaskClass) {
            throw new Error('Task not found: ' + nameOrClass);
        }
        const name = getTaskName(TaskClass);
        const oldTask = this.runningTasks[name];
        if (oldTask) {
            if (!oldTask.runTime) {
                throw new Error('ALREADY EXISTS: ' + name);
            }
            throw new Error('ALREADY RUNNING: ' + name + ' since ' + oldTask.runTime.toISOString());
        }
        let tm = new TaskManager_1.default(options);
        try {
            this.runningTasks[name] = tm;
            tm = await tm.runTaskSetUp(TaskClass, options);
            const nodes = tm.nodesList.filter(function (node) {
                // tasks that appear multiple times in complex tree 
                // only need to be patched if they might be run
                const task = node.data;
                return task.result !== 'NOT_TO_BE_RUN';
            });
            for (const node of nodes) {
                const nodeTask = node.data.name;
                let awaitable = this.awaitableNodes[nodeTask];
                if (!awaitable || !awaitable.active) {
                    const runFn = node.data.run.bind(node.data);
                    awaitable = new SharedWaiting_1.default(nodeTask, runFn);
                    this.awaitableNodes[nodeTask] = awaitable;
                }
                const overideFn = awaitable.getRun(name);
                node.data.run = function (task) {
                    return overideFn(task);
                };
            }
            tm.on('progress', (data) => {
                this.emit('progress', data);
                const awaitable = this.awaitableNodes[Task_1.default.name];
                if (awaitable && !awaitable.active) {
                    delete this.awaitableNodes[Task_1.default.name];
                }
            });
            return name;
        }
        catch (error) {
            this._cleanupRunning(name);
            this.purgeAwaitables();
            throw error;
        }
    }
}
exports.default = Registry;
