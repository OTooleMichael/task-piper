/// <reference types="node" />
import { EventEmitter } from 'events';
import { MinTask, RunResult } from './types';
import Task from './Task';
import Node from './Node';
export declare type TaskConstructor = typeof Task;
interface GlobalOptions {
    fullDepth?: number;
}
interface TaskRegistry {
    [index: string]: Task;
}
declare type RunOrder = Node<Task>[][];
export default class TaskManager extends EventEmitter {
    globalOptions: GlobalOptions;
    taskRegistry: TaskRegistry;
    runTime?: Date;
    task?: Task;
    runId?: string;
    routeNode?: Node<Task>;
    nodesList: Node<Task>[];
    runOrder: RunOrder;
    _events: any;
    constructor(globalOptions?: GlobalOptions);
    runTaskSetUp(TaskClass: TaskConstructor, options: any): Promise<TaskManager>;
    runTask(TaskClass: TaskConstructor, options: any): Promise<RunResult[]>;
    _runTask(): Promise<RunResult[]>;
    makeTree({ task, parent }: {
        task: Task;
        parent?: Task;
    }): Promise<Node<Task>>;
    instanciateChild<P extends MinTask>(TaskClass: TaskConstructor, parentInst: P): Task;
    static runOneTask(TaskClass: TaskConstructor, options: GlobalOptions): Promise<RunResult[]>;
}
export {};
