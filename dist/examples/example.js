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
var index_1 = require("../index");
exports.TaskManager = index_1.TaskManager;
var ProjectTask_1 = __importDefault(require("./ProjectTask"));
function wait(time) {
    if (time === void 0) { time = 200; }
    return new Promise(function (r) { return setTimeout(r, time); });
}
var EChild = /** @class */ (function (_super) {
    __extends(EChild, _super);
    function EChild() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'EChild';
        return _this;
    }
    EChild.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wait(2500)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return EChild;
}(ProjectTask_1.default));
var LeafChild = /** @class */ (function (_super) {
    __extends(LeafChild, _super);
    function LeafChild() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'LeafChild';
        return _this;
    }
    LeafChild.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wait(5000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return LeafChild;
}(ProjectTask_1.default));
var ExtendedCutOff = /** @class */ (function (_super) {
    __extends(ExtendedCutOff, _super);
    function ExtendedCutOff() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'ExtendedCutOff';
        _this.cutOffTime = 1000 * 60 * 60;
        return _this;
    }
    ExtendedCutOff.prototype.requires = function () {
        return [
            EChild,
            LeafChild
        ];
    };
    ExtendedCutOff.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wait(1600)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ExtendedCutOff;
}(ProjectTask_1.default));
var EChild3Data = {
    name: 'EChild3',
    requires: function requires() {
        return [EChild];
    },
    run: function run(task) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(task.name, task.runTime);
                        return [4 /*yield*/, wait(1500)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
};
var EChild3 = ProjectTask_1.default.createTask(EChild3Data);
var EChild4 = /** @class */ (function (_super) {
    __extends(EChild4, _super);
    function EChild4() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'EChild4';
        return _this;
    }
    EChild4.prototype.requires = function () {
        return [
            EChild3
        ];
    };
    EChild4.prototype.isComplete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastRun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkLastRun()];
                    case 1:
                        lastRun = _a.sent();
                        this.lastRun = lastRun || { event: 'completed' };
                        return [2 /*return*/, !!lastRun && lastRun.event === 'completed'];
                }
            });
        });
    };
    EChild4.prototype.poleCompletion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var maxPoles, i, lastRun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        maxPoles = 100;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(this.lastRun && this.lastRun.event !== 'completed')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.checkLastRun()];
                    case 2:
                        lastRun = _a.sent();
                        this.lastRun = lastRun || { event: 'completed' };
                        console.log('POLE ', i, this.lastRun);
                        return [4 /*yield*/, wait(1000)];
                    case 3:
                        _a.sent();
                        i++;
                        if (i >= maxPoles) {
                            throw new Error('TOO MANY POLES');
                        }
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EChild4.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastRun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastRun = this.lastRun;
                        if (!lastRun) {
                            throw new Error('.lastRun not loaded');
                        }
                        if (lastRun.event !== 'completed') {
                            return [2 /*return*/, this.poleCompletion()];
                        }
                        return [4 /*yield*/, wait(5000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return EChild4;
}(ProjectTask_1.default));
var RouteExample = /** @class */ (function (_super) {
    __extends(RouteExample, _super);
    function RouteExample() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'RouteExample';
        return _this;
    }
    RouteExample.prototype.requires = function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, EChild3];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, ExtendedCutOff];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, EChild4];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    RouteExample.prototype.run = function () {
        return null;
    };
    return RouteExample;
}(index_1.Task));
exports.RouteExample = RouteExample;
// async function start(): Promise<void>{
// 	const res = await EChild3.run({});
// 	console.log(res);
// }
var makeTask = function () {
    return new index_1.TaskManager({});
};
exports.makeTask = makeTask;
