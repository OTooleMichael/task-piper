const SimpleTask = require('./lib/Task');
const TaskManager = require('./lib/TaskManager');
class Task extends SimpleTask {
	static run(options){ // this allows a quite check on the Tasks functioning without using other Classes
		let TaskClass = this;
		return TaskManager.runOneTask(TaskClass,options);
	}
}
module.exports = {
	TaskManager,
	Task
}