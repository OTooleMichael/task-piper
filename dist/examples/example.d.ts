import { Task, Registry } from '../index';
import ProjectTask from './ProjectTask';
export declare type TaskConstructor = typeof Task;
declare class MyRegistry extends Registry {
    add(TaskClass: typeof ProjectTask): this;
}
declare const registry: MyRegistry;
export default registry;
