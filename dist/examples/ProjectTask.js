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
const index_1 = require("../index");
const db_1 = __importDefault(require("./db"));
class ProjectTask extends index_1.Task {
    constructor(options) {
        super(options);
        this.registry = options.registry;
        this.db = db_1.default;
        this.cutOffTime = 1000 * 60 * 15;
    }
    getTaskByName(name) {
        if (!this.registry) {
            throw 'registry missing';
        }
        return this.registry.get(name);
    }
    resolveRequirement(value) {
        console.log(value, 'RESOLVE');
        return value;
    }
    checkLastRun() {
        return __awaiter(this, void 0, void 0, function* () {
            const { cutOffTime, runTime, name } = this;
            const minTime = new Date(runTime.valueOf() - cutOffTime);
            const rows = yield db_1.default.find({ match: function (row) {
                    const { loggedAt } = row;
                    return name == row.name && new Date(loggedAt) > minTime;
                } });
            this.lastRuns = rows;
            rows.sort((a, b) => a.loggedAt > b.loggedAt ? 1 : -1);
            const last = rows.pop();
            return last;
        });
    }
    isComplete() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastRun = yield this.checkLastRun();
            this.lastRun = lastRun;
            return !!lastRun && lastRun.event === 'completed';
        });
    }
    log({ event }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, runTime } = this;
            if (!name || !runTime) {
                throw new Error('.name & .runTime is required');
            }
            console.log(event, name, new Date());
            yield db_1.default.write({
                loggedAt: new Date(),
                event,
                name,
                runTime
            });
        });
    }
}
exports.default = ProjectTask;
