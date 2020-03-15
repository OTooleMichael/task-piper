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
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const types_1 = require("./types");
function iterate(it) {
    return __awaiter(this, void 0, void 0, function* () {
        const out = [];
        let result = yield it.next();
        while (!result.done) {
            out.push(result.value);
            result = yield it.next();
        }
        return out;
    });
}
class Task {
    constructor(options) {
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
        throw new Error('.log Not Implemented');
    }
    isComplete() {
        throw new Error('.isComplete Not Implemented');
    }
    //eslint-disable-next-line
    run(task) {
        throw new Error('.run Not Implemented');
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
            throw new Error('._startedAt not defined');
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
    _isComplete() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isCompleted = yield this.isComplete();
            return this.isCompleted;
        });
    }
    _requires() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requires = yield Task.normaliseIterator(this.requires());
                return requires.map(value => {
                    return this.resolveRequirement(value);
                });
            }
            catch (error) {
                console.log(this.name);
                throw error;
            }
        });
    }
    _preRunCheck() {
        if (this.preRunCheck) {
            return this.preRunCheck();
        }
        return false;
    }
    _run() {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this._preRunCheck();
                yield this._markAsStarted();
                this.results = yield this.run(this);
                yield this._markAsComplete();
                out.result = this.result = types_1.ResultState.RUN;
                out.results = this.results;
                out.ranFor = this.ranFor;
                return out;
            }
            catch (error) {
                this.result = types_1.ResultState.ERROR;
                this.error = error;
                yield this.log({ event: 'error' });
                throw error;
            }
        });
    }
    static normaliseIterator(toIterate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (toIterate === undefined) {
                return [];
            }
            if (typeof toIterate.next === 'function') {
                return iterate(toIterate);
            }
            return toIterate;
        });
    }
    static createTask(params) {
        const { name } = params;
        if (!name)
            throw new Error('name is a required field');
        const SuperMostTaskClass = this || Task;
        class MixinTask extends SuperMostTaskClass {
            constructor(options) {
                super(options);
                for (const k in params) {
                    this[k] = params[k];
                }
            }
        }
        return MixinTask;
    }
}
exports.default = Task;
