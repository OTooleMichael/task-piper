import { v4 as uuid } from 'uuid'
import { 
	TaskOptions, TaskBase, ResultState, 
	LogableEvent, RunResult 
} from './types'
async function iterate<T>(it: IterableIterator<T>): Promise<T[]>{
	const out: any[] = []
	let result = await it.next();
	while (!result.done){
		out.push(result.value); 
		result = await it.next();
	}
	return out
}
class NotImplementedError extends Error {
	constructor(method: string, taskName: string){
		super(`Method .${method} Not Implemented: ${taskName}`)
	}
}
const wait = (t: number): Promise<void> => new Promise(resolve=>setTimeout(resolve,t))



export default class Task implements TaskBase {
	node?: any; // its a Node
	name = 'NOT_IMPLEMENTED';
	options: any;
	runId: string;
	runTime: Date;
	depth: number;
	_startedAt?: Date;
	_isCompletedAt?: Date;
	ranFor?: number;
	result?: ResultState;
	isCompleted: boolean;
	tier?: number;
	results?: any;
	error?: Error;
	_requiredTasks?: (typeof Task)[];
	_awaitedRun?: Promise<RunResult>;
	timeoutMillis = 0;
	constructor(options?: TaskOptions) {
		if(!options){
			options = { depth:0 };
		}
		this.runId = uuid();
		this.options = {...options}
		this.options.runTime = this.options.runTime || new Date();
		this.runTime = this.options.runTime;
		this.depth = options.depth ||  0
		this.isCompleted = false
		this.result = undefined
		return this
	}
	//eslint-disable-next-line
	log(data: LogableEvent): void { 
		// should be implmented if loggging is desired
	}
	isComplete(): boolean | Promise<boolean> {
		throw new NotImplementedError('isComplete', this.name)
	}
	//eslint-disable-next-line
	run(task?: Task): any {
		throw new NotImplementedError('run', this.name)
	}
	preRunCheck(): boolean | Promise<boolean> {
		return true
	}
	requires(): IterableIterator<any> | any[] {
		return ([] as TaskConstructor[])
	}
	resolveRequirement(value: any): TaskConstructor {
		return value as TaskConstructor
	}
	_markAsStarted(): void{
		this._startedAt = new Date();
		this.log({event:'started'})
	}
	_markAsComplete(): void {
		if(!this._startedAt){
			throw new Error('._startedAt is not set: ' + this.name)
		}
		this._isCompletedAt = new Date();
		this.ranFor = this._isCompletedAt.valueOf() - this._startedAt.valueOf()
		this.log({event:'completed'})
	}
	_status(): ResultState {
		if(this.result){
			return this.result
		}
		if(this._startedAt){
			return ResultState.RUNNING
		}
		return ResultState.PENDING
	}
	async _isComplete(): Promise<boolean>{
		this.isCompleted = await this.isComplete()
		return this.isCompleted
	}
	async _requires(): Promise<TaskConstructor[] >{
		try{
			const requires = await Task.normaliseIterator(this.requires())
			return requires.map(value=>{
				return this.resolveRequirement(value)
			})
		}catch(error){
			console.log(this.name)
			throw error
		}
	}
	_preRunCheck(): boolean | Promise<boolean>{
		if(this.preRunCheck){
			return this.preRunCheck();
		}
		return false;
	}
	awaitRun(): Promise<RunResult>{
		if(!this._awaitedRun){
			this._awaitedRun = this._run()
		}
		return this._awaitedRun
	}
	async _run(): Promise<RunResult>{
		const out: RunResult = {
			result:this.result,
			name:this.name,
			depth:this.depth,
			tier:this.tier,
			ranFor:0
		}
		if(this.result){
			return out
		}
		try{
			await this._preRunCheck();
			await this._markAsStarted();
			if(this.timeoutMillis){
				this.results = await Promise.race([
					this.run(this),
					wait(this.timeoutMillis).then(()=>{
						const e = new Error(`Timeout ${this.timeoutMillis}: ${this.name}`)
						return Promise.reject(e)
					})
				]) 
			}else{
				this.results = await this.run(this)
			}
			await this._markAsComplete();
			out.result = this.result = ResultState.RUN;
			out.results = this.results;
			out.ranFor = this.ranFor;
			return out
		}catch(error){
			this.result = ResultState.ERROR;
			this.error = error;
			throw error;
		}
	}
	static async normaliseIterator<T>(toIterate: IterableIterator<T> | T[]): Promise<T[]>{
		if(toIterate === undefined){
			return []
		}
		if( typeof (toIterate as IterableIterator<T>).next === 'function' ){
			return iterate(toIterate as IterableIterator<T>)
		}
		return (toIterate as T[])
	}
	public static createTask(params: { name: string }): typeof Task{
		const { name, ...restParams } = params;
		if(!name) throw new Error('name is a required field');
		const SuperMostTaskClass = this || Task;
		class MixinTask extends SuperMostTaskClass{
			name = name;
			constructor(options){
				super(options)
				for(const k in restParams){
					this[k] = restParams[k];
				}
			}
		}
		return MixinTask
	}
}
export type TaskConstructor = typeof Task;
