/// <reference types="node" />
import { EventEmitter } from 'events';
import Task from './Task';
import TaskManager from './TaskManager';
import SharedWaiting from './SharedWaiting';
import { RunResult } from './types';
interface Dict<T> {
    [x: string]: T;
}
export declare function getTaskName(TaskClass: typeof Task): string;
export declare function isSubClass(TaskClass: typeof Task): boolean;
declare type CreateFromObjectPayload = {
    name: string;
    [x: string]: any;
};
export default class Registry extends EventEmitter {
    tasks: Dict<typeof Task>;
    awaitableNodes: Dict<SharedWaiting>;
    runningTasks: Dict<TaskManager>;
    recentlyFinished: Dict<TaskManager>;
    cleanupTimeout: number;
    constructor();
    purgeAwaitables(): void;
    list(): string[];
    add(TaskClass: typeof Task): this;
    create(payload: CreateFromObjectPayload | (typeof Task), SuperClass?: typeof Task): this;
    get(name: string): typeof Task;
    getRunning(name: string): TaskManager | undefined;
    getTaskRun(name: string): TaskManager | undefined;
    _cleanupRunning(name: string): this;
    runTask(nameOrClass: typeof Task | string, options?: {}): Promise<RunResult[]>;
    initTaskManager(nameOrClass: typeof Task | string, options?: {}): Promise<string>;
}
export {};
