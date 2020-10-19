"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const ProjectTask_1 = __importDefault(require("./ProjectTask"));
function wait(time = 200) {
    return new Promise(r => setTimeout(r, time));
}
class EChild extends ProjectTask_1.default {
    constructor() {
        super(...arguments);
        this.name = 'EChild';
    }
    async run() {
        await wait(2500);
    }
}
class LeafChild extends ProjectTask_1.default {
    constructor() {
        super(...arguments);
        this.name = 'LeafChild';
    }
    async run() {
        await wait(5000);
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
    async run() {
        await wait(1600);
    }
}
const EChild3Data = {
    name: 'EChild3',
    requires: function requires() {
        return [EChild];
    },
    async run() {
        await wait(1500);
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
    async isComplete() {
        const lastRun = await this.checkLastRun();
        this.lastRun = lastRun || { event: 'completed' };
        return !!lastRun && lastRun.event === 'completed';
    }
    async poleCompletion() {
        const maxPoles = 100;
        let i = 0;
        while (this.lastRun && this.lastRun.event !== 'completed') {
            const lastRun = await this.checkLastRun();
            this.lastRun = lastRun || { event: 'completed' };
            await wait(1000);
            i++;
            if (i >= maxPoles) {
                throw new Error('TOO MANY POLES');
            }
        }
        return;
    }
    async run() {
        const lastRun = this.lastRun;
        if (!lastRun) {
            throw new Error('.lastRun not loaded');
        }
        if (lastRun.event !== 'completed') {
            return this.poleCompletion();
        }
        await wait(5000);
    }
}
class RouteExample extends ProjectTask_1.default {
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
// async function start(): Promise<void>{
// 	const res = await EChild3.run({});
// 	console.log(res);
// }
class MyRegistry extends index_1.Registry {
    add(TaskClass) {
        TaskClass.registry = this;
        super.add(TaskClass);
        return this;
    }
}
const registry = new MyRegistry();
const tasks = [
    RouteExample,
    EChild,
    EChild3,
    EChild4,
    LeafChild,
    ExtendedCutOff
];
tasks.forEach(function (task) {
    registry.create(task);
});
exports.default = registry;
