const { Task,TaskManager } = require('../index');
const ProjectTask = require('./ProjectTask');
function wait(time=200){
	return new Promise(r=>setTimeout(r,time))
}
class RouteExample extends ProjectTask {
	constructor(options){
		super(options)
		this.name = 'RouteExample';
	}
	* requires(){
		yield EChild3
		yield ExtendedCutOff
		yield EChild4
	}
	async run(){
		await wait(3500)
		return 
	}
}	

class EChild extends ProjectTask {
	constructor(options){
		super(options);
		this.name = 'EChild'
	}
	async run(){
		await wait(2500)
	}
}
class LeafChild extends ProjectTask {
	constructor(options){
		super(options);
		this.name = 'LeafChild';
	}
	async run(){
		await wait(5000)
	}
}
class ExtendedCutOff extends ProjectTask {
	constructor(options){
		super(options);
		this.name = 'ExtendedCutOff';
		this.cutOffTime = 1000*60*60;
	}
	requires(){
		return [
			EChild,
			LeafChild
		]
	}
	async run(){
		await wait(1600)
	}
}
class EChild4 extends ProjectTask {
	constructor(options){
		super(options);
		this.name = 'EChild4'
	}
	requires(){
		return [
			EChild3
		]
	}
	async isComplete(){
		let lastRun = await this.checkLastRun();
		this.lastRun = lastRun || {event:'completed'};
		return lastRun && lastRun.event == 'completed'
	}
	async poleCompletion(){
		let maxPoles = 100;
		let i = 0;
		while(this.lastRun.event !== 'completed'){
			let lastRun = await this.checkLastRun();
			this.lastRun = lastRun || {event:'completed'}
			console.log('POLE ',i,this.lastRun);
			await wait(1000);
			i++;
			if(i >= maxPoles){
				throw new Error('TOO MANY POLES')
			}
		}
		return
	}
	async run(){
		if(this.lastRun.event !== 'completed'){
			return this.poleCompletion();
		}
		await wait(5000)

	}
}
const EChild3 = ProjectTask.createTask({
	name:'EChild3',
	requires:function requires(){
		return [ EChild ]
	},
	run:async function run(task){
		console.log(task.name,task.runTime);
		await wait(1500);
	}
});

async function start(){
	let res = await EChild3.run({});
	console.log(res);
}
module.exports = {
	TaskManager,
	RouteExample,
	makeTask:e=>new TaskManager({})
}




