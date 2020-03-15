import SimpleTask from './Task'
import TaskManager, {TaskConstructor} from './TaskManager'
import { RunResult } from './types'

function run(TaskClass: TaskConstructor,options): Promise<RunResult[]>{ // this allows a quite check on the Tasks functioning without using other Classes
	return TaskManager.runOneTask(TaskClass,options);
}
class Task extends SimpleTask {
	static run(options): any{
		return run(this, options)
	}
}
export {TaskManager,Task}
