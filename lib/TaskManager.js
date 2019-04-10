const Task = require('./Task');
const Node = require('./Node');
function createRunningOrder(treeRoot){
	let nodes = [];
	treeRoot.traverse(function(node,i) {
		node.tier = node.distanceFromLeaf();
		nodes.push(node)
	});
	nodes.sort((a,b)=>a.tier > b.tier ? 1 : -1);
	let inList = {};
	let tier = null;
	let list = [];
	let results = [];
	nodes.forEach(function(node) {
		if(node.tier !== tier){
			tier = node.tier;
			list.push([]);
		};
		if(inList[node.name]){
			node.data.result = 'NOT_TO_BE_RUN'
			return
		};
		inList[node.name] = true;
		node.data.tier = tier;
		let myTier = list.pop();
		myTier.push(node);
		list.push(myTier);
	});
	return {
		nodes,
		list
	}
}
class TaskManager {
	constructor(globalOptions){
		this.globalOptions = globalOptions
		return this
	}
	async runTaskSetUp(TaskClass,options){
		this.runTime = new Date();
		this.task = this.instanciateChild(TaskClass,{options,depth:0})
		this.routeNode = await this.makeTree(this.task,null);
		const {nodes,list} = createRunningOrder(this.routeNode);
		this.nodesList = nodes;
		this.runOrder = list;
		return this;
	}
	async runTask(TaskClass,options){
		await this.runTaskSetUp(TaskClass,options)
		let results = [];
		for(let tier of this.nodesList){
			// group all tasks that can run at the same tier
			let res = await Promise.all(tier.map(node=>{
				return node.data._run();
			}))
			results = results.concat(res);
		}
		return results;
	}
	async makeTree(task,parent){
		let parentNode = parent ? parent.node : null;
		let node = new Node(task,parentNode);
		if(node.isCircular){
			let e = new Error('Circular Dependency: '+task.name);
			e.dependencyPath = node.path.map(n=>n.name).concat(task.name)
			throw e
		};
		task.node = node;
		if(parentNode){
			parentNode.addChildNode(node);
		};
		let isComplete = await task.isComplete();
		node.status = 'PENDING';
		if(isComplete){
			node.status = 'IS_ALREADY_COMPLETE';
			task.result = 'IS_ALREADY_COMPLETE'
			return node
		};
		let requires = task._requiredTasks = await task._requires();
		for(let TaskClass of requires){
			let inst = this.instanciateChild(TaskClass,task);
			await this.makeTree(inst,task);
		}
		return node;
	} 
	instanciateChild(TaskClass,parentInst){
		let {options,depth=0} = parentInst;
		let opts = Object.assign(
			{taskManager:this,runTime:this.runTime},
			options,
			{depth:depth + 1}
		);
		let inst = new TaskClass(opts,parentInst);
		validateTaskInst(inst)
		return inst
	}
	static runOneTask(TaskClass,options){
		let tm = new TaskManager(options);
		return tm.runTask(TaskClass,options);
	}
}
function validateTaskInst(inst){
	if(!(inst instanceof Task)){
		throw new Error('Is Not an instanceof Task Class');
	}
	if(!inst.name){
		throw new Error('this.name must be defined for All Task Instances');
	}
	let requiredMethods = ['isComplete','log']
	for(let m of requiredMethods){
		if(typeof inst[m] !== 'function'){
			throw new Error(m+' is a required Method of '+inst.name)
		}
	}
};

module.exports = TaskManager