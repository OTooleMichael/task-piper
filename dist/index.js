"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = __importDefault(require("./Task"));
const TaskManager_1 = __importDefault(require("./TaskManager"));
exports.TaskManager = TaskManager_1.default;
function run(TaskClass, options) {
    return TaskManager_1.default.runOneTask(TaskClass, options);
}
class Task extends Task_1.default {
    static run(options) {
        return run(this, options);
    }
}
exports.Task = Task;
