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
exports.TaskManager = index_1.TaskManager;
const ProjectTask_1 = __importDefault(require("./ProjectTask"));
function wait(time = 200) {
    return new Promise(r => setTimeout(r, time));
}
class EChild extends ProjectTask_1.default {
    constructor() {
        super(...arguments);
        this.name = 'EChild';
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield wait(2500);
        });
    }
}
class LeafChild extends ProjectTask_1.default {
    constructor() {
        super(...arguments);
        this.name = 'LeafChild';
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield wait(5000);
        });
    }
}
class ExtendedCutOff extends ProjectTask_1.default {
    constructor() {
        super(...arguments);
        this.name = 'ExtendedCutOff';
        this.cutOffTime = 1000 * 60 * 60;
    }
    requires() {
        return [
            EChild,
            LeafChild
        ];
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield wait(1600);
        });
    }
}
const EChild3Data = {
    name: 'EChild3',
    requires: function requires() {
        return [EChild];
    },
    run: function run(task) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(task.name, task.runTime);
            yield wait(1500);
        });
    }
};
const EChild3 = ProjectTask_1.default.createTask(EChild3Data);
class EChild4 extends ProjectTask_1.default {
    constructor() {
        super(...arguments);
        this.name = 'EChild4';
    }
    requires() {
        return [
            EChild3
        ];
    }
    isComplete() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastRun = yield this.checkLastRun();
            this.lastRun = lastRun || { event: 'completed' };
            return !!lastRun && lastRun.event === 'completed';
        });
    }
    poleCompletion() {
        return __awaiter(this, void 0, void 0, function* () {
            const maxPoles = 100;
            let i = 0;
            while (this.lastRun && this.lastRun.event !== 'completed') {
                const lastRun = yield this.checkLastRun();
                this.lastRun = lastRun || { event: 'completed' };
                console.log('POLE ', i, this.lastRun);
                yield wait(1000);
                i++;
                if (i >= maxPoles) {
                    throw new Error('TOO MANY POLES');
                }
            }
            return;
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastRun = this.lastRun;
            if (!lastRun) {
                throw new Error('.lastRun not loaded');
            }
            if (lastRun.event !== 'completed') {
                return this.poleCompletion();
            }
            yield wait(5000);
        });
    }
}
class RouteExample extends index_1.Task {
    constructor() {
        super(...arguments);
        this.name = 'RouteExample';
    }
    *requires() {
        yield EChild3;
        yield ExtendedCutOff;
        yield EChild4;
    }
    run() {
        return null;
    }
}
exports.RouteExample = RouteExample;
// async function start(): Promise<void>{
// 	const res = await EChild3.run({});
// 	console.log(res);
// }
const makeTask = function () {
    return new index_1.TaskManager({});
};
exports.makeTask = makeTask;
