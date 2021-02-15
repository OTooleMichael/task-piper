import {EventEmitter} from 'events'
import Task from './Task'
import Node from './Node'
import TaskManager from './TaskManager'
import SharedWaiting from './SharedWaiting'
import {RunResult} from './types'

interface Dict<T>{
	[x: string]: T;
}
export function getTaskName(TaskClass: typeof Task): string {
	const inst = new TaskClass()
	if(!inst.name){
		throw new Error('Name not found')
	}
	return inst.name
}
export function isSubClass(TaskClass: typeof Task): boolean {
	if(TaskClass === Task){
		return true
	}
	try{
		const task = new TaskClass()
		if(task instanceof Task){
			return true
		}
	}catch(error){
		console.log(TaskClass)
		console.log(error)
	}
	return false
}
type CreateFromObjectPayload = {
	name: string;
	[x: string]: any;
}

export default class Registry extends EventEmitter{
	tasks: Dict<typeof Task> = {};
	awaitableNodes: Dict<SharedWaiting> = {};
	runningTasks: Dict<TaskManager> = {};
	recentlyFinished: Dict<TaskManager> = {};
	cleanupTimeout: number = 1000*10;
	constructor(){
		super()
		this.tasks = {}
		this.awaitableNodes = {}
		this.runningTasks = {}
	}
	purgeAwaitables(): void{
		for(const key in this.awaitableNodes){
			const awaitable = this.awaitableNodes[key]
			if(!awaitable.active){
				delete this.awaitableNodes[key]
			}
		}
	}
	list(): string[]{
		return Object.keys(this.tasks)
	}
	add(TaskClass: typeof Task): this{
		if( !isSubClass(TaskClass) ){
			throw new Error('Registry.add must be provided a Task Class')
		}
		const name = getTaskName(TaskClass)
		if(!name){
			throw new Error('"name" is a required Field');
		}
		if( this.get(name) ){
			throw new Error('Task is already registered: '+name);
		}
		this.tasks[name] = TaskClass
		return this
	}
	create(
		payload: CreateFromObjectPayload | (typeof Task), 
		SuperClass: typeof Task = Task 
	): this {
		if(typeof payload === 'function'){
			return this.add(payload as typeof Task)
		}
		const TaskClass = SuperClass.createTask(payload);
		return this.add(TaskClass);
	}
	get(name: string): typeof Task{
		return this.tasks[name]
	}
	getRunning(name: string): TaskManager | undefined{
		return this.runningTasks[name]
	}
	getTaskRun(name: string): TaskManager | undefined{
		return this.getRunning(name) || this.recentlyFinished[name]
	}
	_cleanupRunning(name: string): this {
		const task = this.runningTasks[name]
		if(!task){
			return this
		}
		this.recentlyFinished[name] = task
		delete this.runningTasks[name]
		setTimeout(()=>{
			delete this.recentlyFinished[name]
		},this.cleanupTimeout)
		return this
	}
	async runTask(nameOrClass: typeof Task | string, options={}): Promise<RunResult[]>{
		let name = '__dummyKey__'
		try{
			name = await this.initTaskManager(nameOrClass, options)
			const tm = this.getRunning(name)
			if(!tm){
				throw new Error('Manager not Init '+name)
			}
			const res = await tm._runTask()
			return res
		}finally{
			this._cleanupRunning(name)
			this.purgeAwaitables()
		}
	}
	async initTaskManager(nameOrClass: typeof Task | string, options={}): Promise<string>{
		if(!nameOrClass){
			throw new Error('nameOrClass is Required')
		}
		let TaskClass: typeof Task | null = null
		if(typeof nameOrClass === 'string'){
			TaskClass = this.get(nameOrClass);
		}else{
			TaskClass = nameOrClass
		}
		if(!TaskClass){
			throw new Error('Task not found: '+nameOrClass)
		}
		const name = getTaskName(TaskClass)
		const oldTask = this.runningTasks[name]
		if(oldTask){
			if(!oldTask.runTime){
				throw new Error('ALREADY EXISTS: '+name);
			}
			throw new Error('ALREADY RUNNING: '+name+' since '+oldTask.runTime.toISOString());
		}
		let tm = new TaskManager(options);
		try{
			this.runningTasks[name] = tm;
			tm = await tm.runTaskSetUp(TaskClass,options)
			const nodes = tm.nodesList.filter(function(node: Node<Task>){
				// tasks that appear multiple times in complex tree 
				// only need to be patched if they might be run
				const task = node.data;
				return task.result !== 'NOT_TO_BE_RUN'; 
			})
			for(const node of nodes){
				const nodeTask = node.data.name
				let awaitable = this.awaitableNodes[nodeTask]
				if(!awaitable || !awaitable.active){
					const runFn = node.data.run.bind(node.data)
					awaitable = new SharedWaiting(nodeTask, runFn)
					this.awaitableNodes[nodeTask] = awaitable	
				}
				const overideFn = awaitable.getRun(name)
				node.data.run = function(task: Task): ReturnType<typeof overideFn> {
					return overideFn(task)
				}
			}
			tm.on('progress',(data: Task)=>{
				this.emit('progress',data)
				const awaitable = this.awaitableNodes[Task.name]
				if(awaitable && !awaitable.active){
					delete this.awaitableNodes[Task.name]
				}
			})
			return name
		}catch(error){
			this._cleanupRunning(name)
			this.purgeAwaitables()
			this.emit('error',error)
			throw error
		}
	}
}