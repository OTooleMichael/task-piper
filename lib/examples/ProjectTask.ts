import { Task  } from '../index'
import db, {LogEvent} from './db'
interface RunData {
	event: string;
}
type TaskConstructor = typeof Task
export default class ProjectTask extends Task {
	lastRun?: RunData;
	cutOffTime: number;
	db: typeof db;
	lastRuns?: RunData[];
	static registry?: any;
	constructor(options){
		super(options);
		this.db = db;
		this.cutOffTime = 1000*60*15
	}
	resolveRequirement(value: TaskConstructor | string): TaskConstructor{
		if(typeof value === 'string'){
			return ProjectTask.registry.get(value)
		}
		return value
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
		await db.write({
			loggedAt:new Date(),
			event,
			name,
			runTime
		})
	}
}

