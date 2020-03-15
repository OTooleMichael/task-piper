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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var types_1 = require("./types");
var Task_1 = __importDefault(require("./Task"));
var Node_1 = __importDefault(require("./Node"));
function validateTaskInst(inst) {
    if (!(inst instanceof Task_1.default)) {
        throw new Error('Is Not an instanceof Task Class');
    }
    if (!inst.name) {
        throw new Error('this.name must be defined for All Task Instances');
    }
    var requiredMethods = ['isComplete', 'log'];
    for (var _i = 0, requiredMethods_1 = requiredMethods; _i < requiredMethods_1.length; _i++) {
        var m = requiredMethods_1[_i];
        if (typeof inst[m] !== 'function') {
            throw new Error(m + ' is a required Method of ' + inst.name);
        }
    }
}
var CircularDependencyError = /** @class */ (function (_super) {
    __extends(CircularDependencyError, _super);
    function CircularDependencyError(message, dependencyPath) {
        var _this = _super.call(this, message) || this;
        _this.dependencyPath = dependencyPath;
        return _this;
    }
    return CircularDependencyError;
}(Error));
function createRunningOrder(treeRoot) {
    var nodes = [];
    treeRoot.traverse(function (node) {
        node.tier = node.distanceFromLeaf();
        nodes.push(node);
    });
    nodes.sort(function (a, b) {
        return (a.tier || 0) > (b.tier || 0) ? 1 : -1;
    });
    var inList = {};
    var currentTier = undefined;
    var list = [];
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
        var myTier = list.pop();
        if (!myTier) {
            return;
        }
        myTier.push(node);
        list.push(myTier);
    });
    return {
        nodes: nodes,
        list: list
    };
}
var TaskManager = /** @class */ (function (_super) {
    __extends(TaskManager, _super);
    function TaskManager(globalOptions) {
        var _this = _super.call(this) || this;
        _this.globalOptions = globalOptions || {};
        _this.taskRegistry = {};
        _this.nodesList = [];
        _this.runOrder = [];
        return _this;
    }
    TaskManager.prototype.runTaskSetUp = function (TaskClass, options) {
        return __awaiter(this, void 0, void 0, function () {
            var minTaskOptions, task, routeNode, _a, nodes, list;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.runTime = new Date();
                        minTaskOptions = { options: options, depth: 0 };
                        task = this.task = this.instanciateChild(TaskClass, minTaskOptions);
                        if (!task) {
                            throw new Error('.task not found');
                        }
                        this.runId = task.runId;
                        return [4 /*yield*/, this.makeTree({ task: task, parent: undefined })];
                    case 1:
                        routeNode = _b.sent();
                        this.routeNode = routeNode;
                        _a = createRunningOrder(routeNode), nodes = _a.nodes, list = _a.list;
                        this.nodesList = nodes;
                        this.runOrder = list;
                        return [2 /*return*/, this];
                }
            });
        });
    };
    TaskManager.prototype.runTask = function (TaskClass, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runTaskSetUp(TaskClass, options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this._runTask()];
                }
            });
        });
    };
    TaskManager.prototype._runTask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, _a, tier, res, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        results = [];
                        _i = 0, _a = this.runOrder;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        tier = _a[_i];
                        return [4 /*yield*/, Promise.all(tier.map(function (node) { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, node.data._run()];
                                        case 1:
                                            result = _a.sent();
                                            this.emit('progress', node.data);
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); }))];
                    case 2:
                        res = _b.sent();
                        results = results.concat(res);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.emit('complete', results);
                        return [2 /*return*/, results];
                    case 5:
                        error_1 = _b.sent();
                        if (this._events.error) {
                            this.emit('error', error_1);
                        }
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    TaskManager.prototype.makeTree = function (_a) {
        var task = _a.task, parent = _a.parent;
        return __awaiter(this, void 0, void 0, function () {
            var name, oldTask, parentNode, node, dependencyPath, isComplete, _b, requires, _c, _i, requires_1, TaskClass, inst;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        name = task.name;
                        if (!name) {
                            throw new Error('.name is Required');
                        }
                        oldTask = this.taskRegistry[name];
                        if (!oldTask) {
                            this.taskRegistry[name] = task;
                        }
                        parentNode = parent ? parent.node : null;
                        node = new Node_1.default(task, parentNode);
                        if (node.isCircular) {
                            dependencyPath = node.path.map(function (n) { return n.name; }).concat(name);
                            throw new CircularDependencyError('Circular Dependency: ' + name, dependencyPath);
                        }
                        task.node = node;
                        if (parentNode) {
                            parentNode.addChildNode(node);
                        }
                        if (!oldTask) return [3 /*break*/, 1];
                        _b = oldTask.isCompleted;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, task._isComplete()];
                    case 2:
                        _b = _d.sent();
                        _d.label = 3;
                    case 3:
                        isComplete = _b;
                        node.status = types_1.ResultState.PENDING;
                        if (isComplete) {
                            node.status = types_1.ResultState.IS_ALREADY_COMPLETE;
                            task.result = types_1.ResultState.IS_ALREADY_COMPLETE;
                            if (!this.globalOptions.fullDepth) {
                                return [2 /*return*/, node];
                            }
                        }
                        _c = task;
                        return [4 /*yield*/, task._requires()];
                    case 4:
                        requires = _c._requiredTasks = _d.sent();
                        _i = 0, requires_1 = requires;
                        _d.label = 5;
                    case 5:
                        if (!(_i < requires_1.length)) return [3 /*break*/, 8];
                        TaskClass = requires_1[_i];
                        inst = this.instanciateChild(TaskClass, task);
                        return [4 /*yield*/, this.makeTree({ task: inst, parent: task })];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, node];
                }
            });
        });
    };
    TaskManager.prototype.instanciateChild = function (TaskClass, parentInst) {
        var options = parentInst.options, _a = parentInst.depth, depth = _a === void 0 ? 0 : _a;
        var opts = Object.assign({ taskManager: this, runTime: this.runTime }, options, { depth: depth + 1 });
        var inst = new TaskClass(opts);
        validateTaskInst(inst);
        return inst;
    };
    TaskManager.runOneTask = function (TaskClass, options) {
        var tm = new TaskManager(options);
        return tm.runTask(TaskClass, options);
    };
    return TaskManager;
}(events_1.EventEmitter));
exports.default = TaskManager;
