declare type AnyAsyncFn = (...args: any[]) => Promise<any>;
export default class SharedWaiting {
    active: boolean;
    routes: string[];
    name: string;
    awaitable?: Promise<any>;
    isRunning: boolean;
    _resolve?: (data?: any) => void;
    _reject?: (reason?: any) => void;
    _run: AnyAsyncFn;
    routeRan?: string;
    constructor(name: string, run: AnyAsyncFn);
    run(route: string, ...args: any[]): Promise<any>;
    getRun(route: string): AnyAsyncFn;
}
export {};
