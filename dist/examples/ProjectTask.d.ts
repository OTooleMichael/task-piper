import { Task } from '../index';
import db, { LogEvent } from './db';
interface RunData {
    event: string;
}
declare type TaskConstructor = typeof Task;
export default class ProjectTask extends Task {
    lastRun?: RunData;
    cutOffTime: number;
    db: typeof db;
    lastRuns?: RunData[];
    static registry?: any;
    constructor(options: any);
    resolveRequirement(value: TaskConstructor | string): TaskConstructor;
    checkLastRun(): Promise<LogEvent | undefined>;
    isComplete(): Promise<boolean>;
    log({ event }: {
        event: any;
    }): Promise<void>;
}
export {};
