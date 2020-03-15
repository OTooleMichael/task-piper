import { Task } from '../index'
import db, {LogEvent} from './db'
import { 
	TaskOptions
} from '../types'
interface RunData {
	event: string;
}
interface ProjectTaskData {
	name: string;
	run: (task?: ProjectTask) => any;
}
interface TaskConstructor {
    new (opts?: TaskOptions): Task;
}
export default class ProjectTask extends Task {
	lastRun?: RunData;
	cutOffTime: number;
	db: typeof db;
	lastRuns?: RunData[];
	registry?: any;
	constructor(options){
		super(options);
		this.registry = options.registry
		this.db = db;
		this.cutOffTime = 1000*60*15
	}
	getTaskByName(name: string): any{
		if(!this.registry){
			throw 'registry missing'
		}
		return this.registry.get(name)
	}
	resolveRequirement(value: any): TaskConstructor{
		console.log(value,'RESOLVE')
		return value as TaskConstructor
	}
	async checkLastRun(): Promise<LogEvent | undefined>{
		const { cutOffTime, runTime, name} = this;
		const minTime = new Date(runTime.valueOf() - cutOffTime);
		const rows = await db.find({match:function(row) {
			const {loggedAt} = row;
			return name == row.name && new Date(loggedAt) > minTime;
		}});
		this.lastRuns = rows;
		rows.sort((a,b)=>a.loggedAt > b.loggedAt ? 1 : -1);
		const last = rows.pop();
		return last
	}
	async isComplete(): Promise<boolean>{
		const lastRun = await this.checkLastRun();
		this.lastRun = lastRun;
		return !!lastRun && lastRun.event === 'completed'
	}
	async log({event}): Promise<void>{
		const { name, runTime } = this;
		if(!name || !runTime){
			throw new Error('.name & .runTime is required');
		}
		console.log(event,name,new Date())
		await db.write({
			loggedAt:new Date(),
			event,
			name,
			runTime
		})
	}
}

