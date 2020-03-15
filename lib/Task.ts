import { v4 as uuid } from 'uuid'
import { 
	TaskOptions, TaskBase, 
	RequireReturn, ResultState, 
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
export default class Task implements TaskBase {
	node?: any; // its a Node
	name?: string;
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
	_requiredTasks?: RequireReturn[];
	constructor(options?: TaskOptions) {
		if(!options){
			options = { depth:0 };
		}
		this.runId = uuid();
		this.options = Object.assign({},options);
		this.options.runTime = this.options.runTime || new Date();
		this.runTime = this.options.runTime;
		this.depth = options.depth ||  0
		this.isCompleted = false
		this.result = undefined
		return this
	}
	//eslint-disable-next-line
	log(data: LogableEvent): void { 
		throw new Error('.log Not Implemented')
	}
	isComplete(): boolean | Promise<boolean> {
		throw new Error('.isComplete Not Implemented')
	}
	//eslint-disable-next-line
	run(task?: Task): any {
		throw new Error('.run Not Implemented')
	}
	preRunCheck(): boolean | Promise<boolean> {
		return true
	}
	requires(): IterableIterator<any> | any[] {
		return ([] as RequireReturn[])
	}
	resolveRequirement(value: any): RequireReturn {
		return value as RequireReturn
	}
	_markAsStarted(): void{
		this._startedAt = new Date();
		this.log({event:'started'})
	}
	_markAsComplete(): void {
		if(!this._startedAt){
			throw new Error('._startedAt not defined')
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
	async _requires(): Promise< RequireReturn[] >{
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
			this.results = await this.run(this);
			await this._markAsComplete();
			out.result = this.result = ResultState.RUN;
			out.results = this.results;
			out.ranFor = this.ranFor;
			return out
		}catch(error){
			this.result = ResultState.ERROR;
			this.error = error;
			await this.log({event:'error'});
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
	static createTask(params: { name: string }): any{
		const { name } = params;
		if(!name) throw new Error('name is a required field');
		const SuperMostTaskClass = this || Task;
		class MixinTask extends SuperMostTaskClass{
			constructor(options){
				super(options)
				for(const k in params){
					this[k] = params[k];
				}
			}
		}
		return MixinTask
	}
}
type TaskClass = new () => Task;


