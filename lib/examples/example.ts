import { Task, Registry } from '../index'
import ProjectTask from './ProjectTask'


export type TaskConstructor = typeof Task

function wait(time=200): Promise<void>{
	return new Promise(r=>setTimeout(r,time))
}

class EChild extends ProjectTask {
	name = 'EChild'
	async run(): Promise<void>{
		await wait(2500)
	}
}
class LeafChild extends ProjectTask {
	name = 'LeafChild'
	async run(): Promise<void>{
		await wait(5000)
	}
}
class ExtendedCutOff extends ProjectTask {
	name = 'ExtendedCutOff';
	cutOffTime = 1000*60*60;
	requires(): TaskConstructor[] {
		return [
			EChild,
			LeafChild
		]
	}
	async run(): Promise<void>{
		await wait(1600)
	}
}
const EChild3Data = {
	name:'EChild3',
	requires:function requires(): TaskConstructor[]{
		return [ EChild ]
	},
	async run(): Promise<void>{
		await wait(1500);
	}
}
const EChild3 = ProjectTask.createTask(EChild3Data);
class EChild4 extends ProjectTask {
	name = 'EChild4'
	requires(): TaskConstructor[] {
		return [
			EChild3
		]
	}
	async isComplete(): Promise<boolean>{
		const lastRun = await this.checkLastRun();
		this.lastRun = lastRun || {event:'completed'};
		return !!lastRun && lastRun.event === 'completed'
	}
	async poleCompletion(): Promise<void>{
		const maxPoles = 100;
		let i = 0;
		while(this.lastRun && this.lastRun.event !== 'completed'){
			const lastRun = await this.checkLastRun();
			this.lastRun = lastRun || {event:'completed'}
			await wait(1000);
			i++;
			if(i >= maxPoles){
				throw new Error('TOO MANY POLES')
			}
		}
		return
	}
	async run(): Promise<void>{
		const lastRun = this.lastRun
		if(!lastRun){
			throw new Error('.lastRun not loaded')
		}
		if(lastRun.event !== 'completed'){
			return this.poleCompletion();
		}
		await wait(5000)

	}
}

class RouteExample extends ProjectTask {
	name = 'RouteExample';
	*requires(): Generator<TaskConstructor>{
		yield EChild3
		yield ExtendedCutOff
		yield EChild4
	}
	run(): any{
		return null
	}
}	

// async function start(): Promise<void>{
// 	const res = await EChild3.run({});
// 	console.log(res);
// }
class MyRegistry extends Registry{
	add(TaskClass: typeof ProjectTask): this{
		TaskClass.registry = this
		super.add(TaskClass)
		return this
	}
}
const registry = new MyRegistry()
const tasks: TaskConstructor[] = [
	RouteExample,
	EChild,
	EChild3,
	EChild4,
	LeafChild,
	ExtendedCutOff
]
tasks.forEach(function(task){
	registry.create(task)
})
export default registry




