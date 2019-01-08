const Task = require('./Task');

function init({dbSave,dbFind}){
	if(!dbSave || !dbFind){
		throw new Error('dbSave and dbFind are required')
	}
	Task.prototype._dbSave = dbSave;
	Task.prototype._dbFind = dbFind;
	return
}

function runTask(TaskClass,options={}) {
	let instance = new TaskClass(options);
	Task.validateTaskInst(instance);
	console.log('RUNNING TASK :',instance.logName)
	console.log('RUN TIME is ',instance.runTime)
	return instance._runAsTopLevel()
}
module.exports = {
	init,
	Task,
	runTask
}