"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var types_1 = require("./types");
function iterate(it) {
    return __awaiter(this, void 0, void 0, function () {
        var out, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    out = [];
                    return [4 /*yield*/, it.next()];
                case 1:
                    result = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!!result.done) return [3 /*break*/, 4];
                    out.push(result.value);
                    return [4 /*yield*/, it.next()];
                case 3:
                    result = _a.sent();
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, out];
            }
        });
    });
}
var Task = /** @class */ (function () {
    function Task(options) {
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
    Task.prototype.log = function (data) {
        throw new Error('.log Not Implemented');
    };
    Task.prototype.isComplete = function () {
        throw new Error('.isComplete Not Implemented');
    };
    //eslint-disable-next-line
    Task.prototype.run = function (task) {
        throw new Error('.run Not Implemented');
    };
    Task.prototype.preRunCheck = function () {
        return true;
    };
    Task.prototype.requires = function () {
        return [];
    };
    Task.prototype.resolveRequirement = function (value) {
        return value;
    };
    Task.prototype._markAsStarted = function () {
        this._startedAt = new Date();
        this.log({ event: 'started' });
    };
    Task.prototype._markAsComplete = function () {
        if (!this._startedAt) {
            throw new Error('._startedAt not defined');
        }
        this._isCompletedAt = new Date();
        this.ranFor = this._isCompletedAt.valueOf() - this._startedAt.valueOf();
        this.log({ event: 'completed' });
    };
    Task.prototype._status = function () {
        if (this.result) {
            return this.result;
        }
        if (this._startedAt) {
            return types_1.ResultState.RUNNING;
        }
        return types_1.ResultState.PENDING;
    };
    Task.prototype._isComplete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.isComplete()];
                    case 1:
                        _a.isCompleted = _b.sent();
                        return [2 /*return*/, this.isCompleted];
                }
            });
        });
    };
    Task.prototype._requires = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requires, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Task.normaliseIterator(this.requires())];
                    case 1:
                        requires = _a.sent();
                        return [2 /*return*/, requires.map(function (value) {
                                return _this.resolveRequirement(value);
                            })];
                    case 2:
                        error_1 = _a.sent();
                        console.log(this.name);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Task.prototype._preRunCheck = function () {
        if (this.preRunCheck) {
            return this.preRunCheck();
        }
        return false;
    };
    Task.prototype._run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var out, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        out = {
                            result: this.result,
                            name: this.name,
                            depth: this.depth,
                            tier: this.tier,
                            ranFor: 0
                        };
                        if (this.result) {
                            return [2 /*return*/, out];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 8]);
                        return [4 /*yield*/, this._preRunCheck()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this._markAsStarted()];
                    case 3:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.run(this)];
                    case 4:
                        _a.results = _b.sent();
                        return [4 /*yield*/, this._markAsComplete()];
                    case 5:
                        _b.sent();
                        out.result = this.result = types_1.ResultState.RUN;
                        out.results = this.results;
                        out.ranFor = this.ranFor;
                        return [2 /*return*/, out];
                    case 6:
                        error_2 = _b.sent();
                        this.result = types_1.ResultState.ERROR;
                        this.error = error_2;
                        return [4 /*yield*/, this.log({ event: 'error' })];
                    case 7:
                        _b.sent();
                        throw error_2;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Task.normaliseIterator = function (toIterate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (toIterate === undefined) {
                    return [2 /*return*/, []];
                }
                if (typeof toIterate.next === 'function') {
                    return [2 /*return*/, iterate(toIterate)];
                }
                return [2 /*return*/, toIterate];
            });
        });
    };
    Task.createTask = function (params) {
        var name = params.name;
        if (!name)
            throw new Error('name is a required field');
        var SuperMostTaskClass = this || Task;
        var MixinTask = /** @class */ (function (_super) {
            __extends(MixinTask, _super);
            function MixinTask(options) {
                var _this = _super.call(this, options) || this;
                for (var k in params) {
                    _this[k] = params[k];
                }
                return _this;
            }
            return MixinTask;
        }(SuperMostTaskClass));
        return MixinTask;
    };
    return Task;
}());
exports.default = Task;
