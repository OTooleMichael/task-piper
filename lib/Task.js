const uuid = require('uuid/v4')

class Task {
	constructor(options) {
		options = options || {};
		this.runId = uuid();
		this.options = Object.assign({},options);
		this.options.runTime = this.options.runTime || new Date();
		this.runTime = this.options.runTime;
		this.depth = options.depth ||  0
		return this
	}
	_markAsStarted(){
		this._startedAt = new Date();
		return this.log({event:'started'})
	}
	_markAsComplete(){
		this._isCompletedAt = new Date();
		this.ranFor = this._isCompletedAt - this._startedAt
		return this.log({event:'completed'})
	}
	_status(){
		if(this.result){
			return this.result
		}
		if(this._startedAt){
			return 'RUNNING'
		}
		return 'PENDING';
	}
	requires(){
		return [];
	}
	async _requires(){
		let res = this.requires();
		if(res.next){
			return iterate(res)
		}
		return res
		async function iterate(it){
		    let out = []
			let result = await it.next();
		    while (!result.done){
		     out.push(result.value); 
		     result = await it.next();
		    }
			return out
		}
	}
	_preRunCheck(){
		if(this.preRunCheck){
			return this.preRunCheck();
		}
		return false;
	}
	async _run() {
		let out = {
			result:this.result,
			name:this.name,
			depth:this.depth,
			tier:this.tier,
			ranFor:0
		}
		if(this.result){
			return out
		};
		try{
			await this._preRunCheck();
			await this._markAsStarted();
			this.results = await this.run(this);
			await this._markAsComplete();
			out.result = this.result = 'RUN';
			out.results = this.results;
			out.ranFor = this.ranFor;
			return out
		}catch(error){
			this.result = 'ERROR';
			this.error  = error;
			await this.log({event:'error'});
			throw error;
		}
	}
	static createTask(params){
		const { name } = params;
		if(!name) throw new Error('name is a required field');
		const SuperMostTaskClass = this || Task;
		class MixinTask extends SuperMostTaskClass {
			constructor(options){
				super(options)
				for(let k in params){
					this[k] = params[k];
				}
			}
		}
		return MixinTask
	}
}
module.exports = Task;







