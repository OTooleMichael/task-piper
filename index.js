const Task = require('./lib/Task');
const TaskManager = require('./lib/TaskManager');

function validateTaskInst(inst){
	if(!(inst instanceof Task)){
		throw new Error('Is Not an instanceof Task Class');
	}
	if(!inst.logName){
		throw new Error('this.logName must be defined for All Task Instances');
	}
	let requiredMethods = ['isComplete','log']
	for(let m of requiredMethods){
		if(typeof inst[m] !== 'function'){
			throw new Error(m+' is a required Method of '+inst.logName)
		}
	}
};

module.exports = {
	TaskManager,
	Task
}