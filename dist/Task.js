"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const types_1 = require("./types");
async function iterate(it) {
    const out = [];
    let result = await it.next();
    while (!result.done) {
        out.push(result.value);
        result = await it.next();
    }
    return out;
}
class NotImplementedError extends Error {
    constructor(method, taskName) {
        super(`Method .${method} Not Implemented: ${taskName}`);
    }
}
const wait = (t) => new Promise(resolve => setTimeout(resolve, t));
class Task {
    constructor(options) {
        this.name = 'NOT_IMPLEMENTED';
        this.timeoutMillis = 0;
        if (!options) {
            options = { depth: 0 };
        }
        this.runId = uuid_1.v4();
        this.options = Object.assign({}, options);
        this.options.runTime = this.options.runTime || new Date();
        this.runTime = this.options.runTime;
        this.depth = options.depth || 0;
        this.isCompleted = false;
        this.result = undefined;
        return this;
    }
    //eslint-disable-next-line
    log(data) {
        // should be implmented if loggging is desired
    }
    isComplete() {
        throw new NotImplementedError('isComplete', this.name);
    }
    //eslint-disable-next-line
    run(task) {
        throw new NotImplementedError('run', this.name);
    }
    preRunCheck() {
        return true;
    }
    requires() {
        return [];
    }
    resolveRequirement(value) {
        return value;
    }
    _markAsStarted() {
        this._startedAt = new Date();
        this.log({ event: 'started' });
    }
    _markAsComplete() {
        if (!this._startedAt) {
            throw new Error('._startedAt is not set: ' + this.name);
        }
        this._isCompletedAt = new Date();
        this.ranFor = this._isCompletedAt.valueOf() - this._startedAt.valueOf();
        this.log({ event: 'completed' });
    }
    _status() {
        if (this.result) {
            return this.result;
        }
        if (this._startedAt) {
            return types_1.ResultState.RUNNING;
        }
        return types_1.ResultState.PENDING;
    }
    async _isComplete() {
        this.isCompleted = await this.isComplete();
        return this.isCompleted;
    }
    async _requires() {
        try {
            const requires = await Task.normaliseIterator(this.requires());
            return requires.map(value => {
                return this.resolveRequirement(value);
            });
        }
        catch (error) {
            console.log(this.name);
            throw error;
        }
    }
    _preRunCheck() {
        if (this.preRunCheck) {
            return this.preRunCheck();
        }
        return false;
    }
    awaitRun() {
        if (!this._awaitedRun) {
            this._awaitedRun = this._run();
        }
        return this._awaitedRun;
    }
    async _run() {
        const out = {
            result: this.result,
            name: this.name,
            depth: this.depth,
            tier: this.tier,
            ranFor: 0
        };
        if (this.result) {
            return out;
        }
        try {
            await this._preRunCheck();
            await this._markAsStarted();
            if (this.timeoutMillis) {
                this.results = await Promise.race([
                    this.run(this),
                    wait(this.timeoutMillis).then(() => {
                        const e = new Error(`Timeout ${this.timeoutMillis}: ${this.name}`);
                        return Promise.reject(e);
                    })
                ]);
            }
            else {
                this.results = await this.run(this);
            }
            await this._markAsComplete();
            out.result = this.result = types_1.ResultState.RUN;
            out.results = this.results;
            out.ranFor = this.ranFor;
            return out;
        }
        catch (error) {
            this.result = types_1.ResultState.ERROR;
            this.error = error;
            throw error;
        }
    }
    static async normaliseIterator(toIterate) {
        if (toIterate === undefined) {
            return [];
        }
        if (typeof toIterate.next === 'function') {
            return iterate(toIterate);
        }
        return toIterate;
    }
    static createTask(params) {
        const { name } = params, restParams = __rest(params, ["name"]);
        if (!name)
            throw new Error('name is a required field');
        const SuperMostTaskClass = this || Task;
        class MixinTask extends SuperMostTaskClass {
            constructor(options) {
                super(options);
                this.name = name;
                for (const k in restParams) {
                    this[k] = restParams[k];
                }
            }
        }
        return MixinTask;
    }
}
exports.default = Task;
