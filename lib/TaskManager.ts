import {EventEmitter} from 'events'
import { 
	MinTask, ResultState, RunResult, TaskOptions 
} from './types'
import Task from './Task'
import Node from './Node'


export interface TaskConstructor {
    new (opts?: TaskOptions): Task;
}
function validateTaskInst(inst): void{
	if(!(inst instanceof Task)){
		throw new Error('Is Not an instanceof Task Class');
	}
	if(!inst.name){
		throw new Error('this.name must be defined for All Task Instances');
	}
	const requiredMethods = ['isComplete','log']
	for(const m of requiredMethods){
		if(typeof inst[m] !== 'function'){
			throw new Error(m+' is a required Method of '+inst.name)
		}
	}
}

class CircularDependencyError extends Error {
	dependencyPath: string[];
	constructor(message: string, dependencyPath: string[]){
		super(message)
		this.dependencyPath = dependencyPath
	}
}
type RunningOrderRes = {
	nodes: Node[];
	list: Node[][];
};
function createRunningOrder(treeRoot: Node): RunningOrderRes{
	const nodes: Node[] = [];
	treeRoot.traverse(function(node){
		node.tier = node.distanceFromLeaf();
		nodes.push(node)
	})
	nodes.sort(function(a,b){
		return (a.tier || 0) > (b.tier || 0) ? 1 : -1
	})
	const inList = {};
	let currentTier: number | undefined = undefined;
	const list: Node[][] = [];
	nodes.forEach(function(node) {
		if(node.tier !== currentTier){
			currentTier = node.tier
			list.push([])
		}
		if(inList[node.name]){
			node.data.result = 'NOT_TO_BE_RUN'
			return
		}
		inList[node.name] = true;
		node.data.tier = currentTier;
		const myTier = list.pop();
		if(!myTier){
			return
		}
		myTier.push(node);
		list.push(myTier);
	});
	return {
		nodes,
		list
	}
}
interface GlobalOptions {
	fullDepth?: number;
}
interface TaskRegistry {
	[index: string]: Task;
}
type RunOrder = Node[][];
export default class TaskManager extends EventEmitter {
	globalOptions: GlobalOptions;
	taskRegistry: any;
	runTime?: Date;
	task?: Task;
	runId?: string;
	routeNode?: Node;
	nodesList: Node[];
	runOrder: RunOrder;
	_events: any;
	constructor(globalOptions?: GlobalOptions){
		super();
		this.globalOptions = globalOptions || {};
		this.taskRegistry = {}
		this.nodesList = []
		this.runOrder = []
		return this
	}
	async runTaskSetUp(TaskClass: TaskConstructor,options): Promise<TaskManager>{
		this.runTime = new Date();
		const minTaskOptions: MinTask = {options,depth:0}
		const task: Task = this.task = this.instanciateChild(TaskClass,minTaskOptions)
		if(!task){
			throw new Error('.task not found')
		}
		this.runId = task.runId;
		const routeNode = await this.makeTree({ task, parent:undefined });
		this.routeNode = routeNode
		const {nodes,list} = createRunningOrder(routeNode);
		this.nodesList = nodes;
		this.runOrder = list;
		return this;
	}
	async runTask(TaskClass: TaskConstructor,options): Promise<any>{
		await this.runTaskSetUp(TaskClass,options)
		return this._runTask();
	}
	async _runTask(): Promise<RunResult[]>{
		try{
			let results: RunResult[] = [];
			for(const tier of this.runOrder){
				// group all tasks that can run at the same tier
				const res: RunResult[] = await Promise.all(tier.map(async node=>{
					const result = await node.data._run()
					this.emit('progress',node.data);
					return result
				}))
				results = results.concat(res);
			}
			this.emit('complete',results);
			return results;
		}catch(error){
			if(this._events.error){
				this.emit('error',error);
			}
			throw error;
		}
	}
	async makeTree({task,parent}: { task: Task; parent?: Task }): Promise<Node>{
		const {name} = task;
		if(!name){
			throw new Error('.name is Required')
		}
		const oldTask: Task = this.taskRegistry[name];
		if(!oldTask){
			this.taskRegistry[name] = task
		}
		const parentNode = parent ? parent.node : null;
		const node = new Node(task, parentNode);
		if(node.isCircular){
			const dependencyPath = node.path.map(n=>n.name).concat(name)
			throw new CircularDependencyError('Circular Dependency: ' + name, dependencyPath);
		}
		task.node = node;
		if(parentNode){
			parentNode.addChildNode(node);
		}
		const isComplete = oldTask ? oldTask.isCompleted : await task._isComplete();
		node.status = ResultState.PENDING
		if(isComplete){
			node.status = ResultState.IS_ALREADY_COMPLETE
			task.result = ResultState.IS_ALREADY_COMPLETE
			if(!this.globalOptions.fullDepth){
				return node
			}
		}
		const requires = task._requiredTasks  = await task._requires();

		for(const TaskClass of requires){
			const inst = this.instanciateChild(TaskClass as TaskConstructor,task);
			await this.makeTree({task:inst,parent:task});
		}
		return node;
	} 
	instanciateChild<P extends MinTask>(TaskClass: TaskConstructor, parentInst: P): Task{
		const {options,depth=0} = parentInst;
		const opts: TaskOptions = Object.assign(
			{taskManager:this,runTime:this.runTime},
			options,
			{depth:depth + 1}
		);
		const inst = new TaskClass(opts);
		validateTaskInst(inst)
		return inst
	}
	static runOneTask(TaskClass: TaskConstructor, options: GlobalOptions): any{
		const tm = new TaskManager(options);
		return tm.runTask(TaskClass,options);
	}
}
