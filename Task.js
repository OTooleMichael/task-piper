

class Task {
	constructor(options) {
		options = options || {};
		this.options = Object.assign({},options);
		this.options.runTime = this.options.runTime || new Date();
		this.runTime = this.options.runTime;
		let parentDepth = options.depth ||  0;
		this.depth = parentDepth;
		if(!this._dbSave || !this._dbFind){
			throw new Error('dbSave and dbFind are required. Please Init')
		}
		return this
	}
	_checkIsRequired({newerThan}={}){
		return this._dbFind({
			task_id:this.logName,
			event_type:'started',
			logged_at:newerThan ? new Date(newerThan) : this.options.runTime
		})
	}
	_markAsStarted(){
		this._startedAt = new Date();
		const payload = {
			task_id:this.logName,
			event_type:'started',
			logged_at:new Date(),
			options:JSON.stringify(this.options)
		}
		return this._dbSave(payload)
	}
	_markAsisComplete(){
		this._isCompletedAt = new Date();
		this.ranFor = this._isCompletedAt - this._startedAt
		const payload = {
			task_id:this.logName,
			event_type:'isCompleted',
			logged_at:new Date(),
			options:JSON.stringify(this.options)
		};
		return this._dbSave(payload)
	}
	requires(){
		return [];
	}
	_requires(){
   	// this will normalise generators or arrays
   	return [ ...this.requires() ]
	}
	async _buildTree(tree,path){
		const {depth:currDepth} = this;
		let myName = this.logName;
		path = path || [myName];
		tree = tree || {};
		tree[myName] = tree[myName] || { name:myName, depth:currDepth, inst:this } 
		let isRequired = await this.isComplete();
		if(!isRequired){
			console.log('NOT REQUIRED',this.logName)
			tree[myName].result = 'IS_ALREADY_COMPLETE'
			return tree;
		};
		let requires = this._requiredTasks = this._requires();
		for(let TaskClass of requires){
			let inst = instanciateChild(TaskClass,this);
			let name = inst.logName;
			if(path.includes(name)){
				let e = new Error('Circular Dependency '+name);
				e.dependencyPath = path
				throw e
			};
			let newTree =  await inst._buildTree( tree, path.concat([name]) );
			tree = mergeTrees(tree,newTree);
		}
		return tree;

	}  
	async _run() {	 
		console.log('Running' ,this.logName)
		await this._markAsStarted();
		await this.run();
		await this._markAsisComplete();
		return { 
			result:'RUN',
			name:this.logName, 
			depth:this.depth,
			ranFor:this.ranFor
		};
	}
	async _runAsTopLevel(){
		let tree = await this._buildTree();
		let list = treeToOrderedArray(tree);

		let results = [];
		let runList = [];
		let runDepth = null;
		for(let el of list){
			// group all tasks that can run at the same tier
			if(!runDepth || el.i < runDepth){
				let res = await runGroup()
				results = results.concat(res);
			}
			runList.push(el);
		}
		if(runList.length){
			let res = await runGroup();
			res.forEach(function(r){
				results.push(r)
			});
		}
		return results;
		async function runGroup(){
			if(!runList.length) return [];
			let par = runList.map(({inst,result,depth,name})=> {
				if(result == 'IS_ALREADY_COMPLETE'){
					return { 
						result, name, depth
					};
				}
				return inst._run();
			})
			let res = await Promise.all(par);
			runList = [];
			return res;
		}
	}
}
function validateTaskInst(inst){
	if(!(inst instanceof Task)){
		throw new Error('Is Not an instanceof Task Class');
	}
	if(!inst.logName){
		throw new Error('this.logName must be defined for All Task Instances');
	}
	let requiredMethods = ['isComplete']
	for(let m of requiredMethods){
		if(typeof inst[m] !== 'function'){
			throw new Error(m+' is a required Method of '+inst.logName)
		}
	}
};

function instanciateChild(TaskClass,parentInst){
	let {options,depth,logName} = parentInst;
	let opts = Object.assign(
		{},
		options,
		{depth:depth + 1}
	);
	let inst = new TaskClass(opts);
	validateTaskInst(inst)
	return inst
}
function mergeTrees(oldTree,newTree){
	for(var k in newTree){
		let newVal = newTree[k];
		let oldVal = oldTree[k];
		if(!oldVal || oldVal.depth < newVal.depth){
			oldTree[k] = newVal;
		};
	}
	return oldTree
}
function treeToOrderedArray(tree){
	let list = Object.keys(tree).map(name =>{
		return tree[name];
	});
	list.sort(function(a,b) {
		return a.depth > b.depth ? -1 : 1
	});
	return list;
}
Task.validateTaskInst = validateTaskInst;
module.exports = Task;







