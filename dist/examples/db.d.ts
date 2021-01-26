export interface LogEvent {
    event: string;
    loggedAt: Date;
    name: string;
    runTime?: Date;
}
interface FindParams {
    limit?: number;
    match(d: LogEvent): boolean;
}
declare function clear(): Promise<void>;
declare function write(payload: LogEvent): Promise<void>;
declare function find(params: FindParams): Promise<LogEvent[]>;
declare const _default: {
    find: typeof find;
    write: typeof write;
    clear: typeof clear;
};
export default _default;
