export interface RunResult {
    depth: number;
    result?: ResultState;
    name?: string;
    tier?: number;
    ranFor?: number;
    results?: any;
}
export interface LogableEvent {
    event: string;
}
export declare enum ResultState {
    INITIALISED = "INITIALISED",
    RUNNING = "RUNNING",
    PENDING = "PENDING",
    RUN = "RUN",
    ERROR = "ERROR",
    NOT_TO_BE_RUN = "NOT_TO_BE_RUN",
    IS_ALREADY_COMPLETE = "IS_ALREADY_COMPLETE"
}
export interface TaskOptions {
    depth: number;
    taskManager?: any;
    runTime?: Date;
}
export interface MinTask {
    options: any;
    depth: number;
    name?: string;
}
export interface TaskBase extends MinTask {
    runId: string;
    runTime: Date;
    isCompleted: boolean;
    node?: any;
    _startedAt?: Date;
    _isCompletedAt?: Date;
    ranFor?: number;
    result?: ResultState;
    tier?: number;
    results?: any;
    error?: Error;
    [x: string]: any;
}
