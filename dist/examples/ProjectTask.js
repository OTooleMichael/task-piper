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
var db_1 = __importDefault(require("./db"));
var ProjectTask = /** @class */ (function (_super) {
    __extends(ProjectTask, _super);
    function ProjectTask(options) {
        var _this = _super.call(this, options) || this;
        _this.registry = options.registry;
        _this.db = db_1.default;
        _this.cutOffTime = 1000 * 60 * 15;
        return _this;
    }
    ProjectTask.prototype.getTaskByName = function (name) {
        if (!this.registry) {
            throw 'registry missing';
        }
        return this.registry.get(name);
    };
    ProjectTask.prototype.resolveRequirement = function (value) {
        console.log(value, 'RESOLVE');
        return value;
    };
    ProjectTask.prototype.checkLastRun = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cutOffTime, runTime, name, minTime, rows, last;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, cutOffTime = _a.cutOffTime, runTime = _a.runTime, name = _a.name;
                        minTime = new Date(runTime.valueOf() - cutOffTime);
                        return [4 /*yield*/, db_1.default.find({ match: function (row) {
                                    var loggedAt = row.loggedAt;
                                    return name == row.name && new Date(loggedAt) > minTime;
                                } })];
                    case 1:
                        rows = _b.sent();
                        this.lastRuns = rows;
                        rows.sort(function (a, b) { return a.loggedAt > b.loggedAt ? 1 : -1; });
                        last = rows.pop();
                        return [2 /*return*/, last];
                }
            });
        });
    };
    ProjectTask.prototype.isComplete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastRun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkLastRun()];
                    case 1:
                        lastRun = _a.sent();
                        this.lastRun = lastRun;
                        return [2 /*return*/, !!lastRun && lastRun.event === 'completed'];
                }
            });
        });
    };
    ProjectTask.prototype.log = function (_a) {
        var event = _a.event;
        return __awaiter(this, void 0, void 0, function () {
            var _b, name, runTime;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = this, name = _b.name, runTime = _b.runTime;
                        if (!name || !runTime) {
                            throw new Error('.name & .runTime is required');
                        }
                        console.log(event, name, new Date());
                        return [4 /*yield*/, db_1.default.write({
                                loggedAt: new Date(),
                                event: event,
                                name: name,
                                runTime: runTime
                            })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ProjectTask;
}(index_1.Task));
exports.default = ProjectTask;
