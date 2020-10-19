"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SharedWaiting {
    constructor(name, run) {
        this.routes = [];
        this.active = true;
        this.name = name;
        this._run = run;
        this.isRunning = false;
    }
    async run(route, ...args) {
        if (!this.routes.includes(route)) {
            throw new Error('Run incorrectly Aquired: ' + route);
        }
        if (this.isRunning) {
            this.routes = this.routes.filter(r => r !== route);
            return this.awaitable;
        }
        this.routeRan = route;
        this.isRunning = true;
        this.awaitable = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        if (!this._resolve || !this._reject) {
            throw new Error('Not Correctly init');
        }
        try {
            const res = await this._run(...args);
            this._resolve(res);
            return res;
        }
        catch (e) {
            this._reject(e);
            throw e;
        }
        finally {
            this.active = false;
            this.routes = this.routes.filter(r => r !== route);
        }
    }
    getRun(route) {
        if (typeof route !== 'string') {
            throw new Error('Invalid Route' + route);
        }
        // if(this.routes.includes(route)){
        // 	throw new Error('Route already exists: '+route)
        // }
        this.routes.push(route);
        return this.run.bind(this, route);
    }
}
exports.default = SharedWaiting;
