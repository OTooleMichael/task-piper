"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const db_1 = __importDefault(require("./db"));
class ProjectTask extends index_1.Task {
    constructor(options) {
        super(options);
        this.db = db_1.default;
        this.cutOffTime = 1000 * 60 * 15;
    }
    resolveRequirement(value) {
        if (typeof value === 'string') {
            return ProjectTask.registry.get(value);
        }
        return value;
    }
    async checkLastRun() {
        const { cutOffTime, runTime, name } = this;
        const minTime = new Date(runTime.valueOf() - cutOffTime);
        const rows = await db_1.default.find({ match: function (row) {
                const { loggedAt } = row;
                return name == row.name && new Date(loggedAt) > minTime;
            } });
        this.lastRuns = rows;
        rows.sort((a, b) => a.loggedAt > b.loggedAt ? 1 : -1);
        const last = rows.pop();
        return last;
    }
    async isComplete() {
        const lastRun = await this.checkLastRun();
        this.lastRun = lastRun;
        return !!lastRun && lastRun.event === 'completed';
    }
    async log({ event }) {
        const { name, runTime } = this;
        if (!name || !runTime) {
            throw new Error('.name & .runTime is required');
        }
        await db_1.default.write({
            loggedAt: new Date(),
            event,
            name,
            runTime
        });
    }
}
exports.default = ProjectTask;
