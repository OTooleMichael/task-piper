"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Registry_1 = __importDefault(require("./Registry"));
const Task_1 = __importDefault(require("./Task"));
const wait = (t = 500) => new Promise(resolve => setTimeout(resolve, t));
function removeTimeVars(r) {
    delete r.ranFor;
    return r;
}
describe('Registry', function () {
    let logs = [];
    let registry = new Registry_1.default();
    class BaseTask extends Task_1.default {
        constructor() {
            super(...arguments);
            this.wait = 100;
        }
        isComplete() {
            return false;
        }
        log(data) {
            logs.push(Object.assign(Object.assign({}, data), { name: this.name }));
        }
        async run() {
            this.log({ event: 'trueCalled' });
            await wait(this.wait);
        }
    }
    class SampleTask extends BaseTask {
        constructor() {
            super(...arguments);
            this.name = 'SampleTask';
        }
    }
    class SampleTask2 extends BaseTask {
        constructor() {
            super(...arguments);
            this.name = 'SampleTask2';
            this.wait = 500;
        }
    }
    class SampleParent extends BaseTask {
        constructor() {
            super(...arguments);
            this.name = 'SampleParent';
        }
        requires() {
            return [SampleTask, SampleTask2];
        }
    }
    class SampleParent2 extends BaseTask {
        constructor() {
            super(...arguments);
            this.name = 'SampleParent2';
        }
        requires() {
            return [SampleTask, SampleTask2, SampleParent];
        }
    }
    beforeEach(function () {
        logs = [];
        registry = new Registry_1.default();
    });
    it('adds Task Classes', function () {
        registry.add(SampleTask);
        registry.add(SampleTask2);
        expect(registry.list()).toEqual(['SampleTask', 'SampleTask2']);
    });
    it('adds Task Object Descriptions', function () {
        registry.create({
            name: 'SampleTask',
            async run() { }
        });
        registry.create({
            name: 'SampleTask2',
            async run() { }
        });
        expect(registry.list()).toEqual(['SampleTask', 'SampleTask2']);
    });
    it('adds Task Object Descriptions', function () {
        registry.create({
            name: 'SampleTask',
            async run() { }
        });
        registry.create({
            name: 'SampleTask2',
            async run() { }
        });
        expect(registry.list()).toEqual(['SampleTask', 'SampleTask2']);
    });
    it('Rejects duplicate Task Names', function () {
        registry.create({
            name: 'SampleTask',
            async run() { }
        });
        expect(() => {
            registry.create(SampleTask);
        }).toThrowError('Task is already registered: SampleTask');
    });
    it('Returns Named Tasks', function () {
        const registry = new Registry_1.default();
        registry.add(SampleTask);
        expect(registry.get('SampleTask')).toBe(SampleTask);
        expect(registry.get('NOT A Task')).toBe(undefined);
    });
    it('Runs a dependency Tree', async function () {
        const registry = new Registry_1.default();
        registry.add(SampleTask);
        registry.add(SampleTask2);
        registry.add(SampleParent);
        const res = await registry.runTask('SampleParent');
        expect(res.map(removeTimeVars)).toEqual([
            { "depth": 2, "name": "SampleTask2", "ranFor": 502, "result": "RUN", "results": undefined, "tier": 0 },
            { "depth": 2, "name": "SampleTask", "ranFor": 502, "result": "RUN", "results": undefined, "tier": 0 },
            { "depth": 1, "name": "SampleParent", "ranFor": 504, "result": "RUN", "results": undefined, "tier": 1 }
        ].map(removeTimeVars));
        expect(logs.filter(({ event }) => event !== 'trueCalled')).toEqual([
            { event: 'started', name: 'SampleTask2' },
            { event: 'started', name: 'SampleTask' },
            { event: 'completed', name: 'SampleTask' },
            { event: 'completed', name: 'SampleTask2' },
            { event: 'started', name: 'SampleParent' },
            { event: 'completed', name: 'SampleParent' }
        ]);
    });
    it('Runs a dependency Tree from Task Class', async function () {
        function removeTimeVars(r) {
            delete r.ranFor;
            return r;
        }
        const registry = new Registry_1.default();
        const res = await registry.runTask(SampleParent);
        expect(res.map(removeTimeVars)).toEqual([
            { "depth": 2, "name": "SampleTask2", "ranFor": 502, "result": "RUN", "results": undefined, "tier": 0 },
            { "depth": 2, "name": "SampleTask", "ranFor": 502, "result": "RUN", "results": undefined, "tier": 0 },
            { "depth": 1, "name": "SampleParent", "ranFor": 504, "result": "RUN", "results": undefined, "tier": 1 }
        ].map(removeTimeVars));
        expect(logs.filter(({ event }) => event !== 'trueCalled')).toEqual([
            { event: 'started', name: 'SampleTask2' },
            { event: 'started', name: 'SampleTask' },
            { event: 'completed', name: 'SampleTask' },
            { event: 'completed', name: 'SampleTask2' },
            { event: 'started', name: 'SampleParent' },
            { event: 'completed', name: 'SampleParent' }
        ]);
    });
    it('Runs two dependency Trees with shared resources', async function () {
        const registry = new Registry_1.default();
        registry.add(SampleTask);
        registry.add(SampleTask2);
        registry.add(SampleParent);
        registry.add(SampleParent2);
        await Promise.all([
            registry.runTask('SampleParent'),
            registry.runTask('SampleParent2'),
        ]);
        // all tasks have a start & complete
        expect(logs.length).toEqual(18);
        // only each unique task has a trueCalled
        expect(logs.filter(({ event }) => event === 'trueCalled').length).toEqual(4);
    });
    it('Can be used during resolution', async function () {
        registry.add(SampleTask);
        registry.add(SampleTask2);
        registry.add(SampleParent);
        registry.add(SampleParent2);
        registry.create({
            name: 'superParent',
            isComplete: () => false,
            requires() {
                return [
                    'SampleTask', 'SampleTask2', SampleParent
                ];
            },
            resolveRequirement: function (name) {
                if (typeof name !== 'string') {
                    return name;
                }
                return registry.get(name);
            },
            async run() { }
        });
        const res = await registry.runTask('superParent');
        const trueCalledLogs = logs.filter(({ event }) => event === 'trueCalled');
        expect(res.map(removeTimeVars)).toEqual([
            {
                result: 'RUN',
                name: 'SampleTask2',
                depth: 3,
                tier: 0,
                ranFor: 505,
                results: undefined
            },
            {
                result: 'RUN',
                name: 'SampleTask',
                depth: 3,
                tier: 0,
                ranFor: 105,
                results: undefined
            },
            {
                result: 'RUN',
                name: 'SampleParent',
                depth: 2,
                tier: 1,
                ranFor: 102,
                results: undefined
            },
            {
                result: 'RUN',
                name: 'superParent',
                depth: 1,
                tier: 2,
                ranFor: 1,
                results: undefined
            }
        ].map(removeTimeVars));
        expect(trueCalledLogs).toEqual([
            { event: 'trueCalled', name: 'SampleTask2' },
            { event: 'trueCalled', name: 'SampleTask' },
            { event: 'trueCalled', name: 'SampleParent' }
        ]);
    });
});
