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
   		// this will normalise generators or arrays
   		return [ ...this.requires() ]
	}
	_preRunCheck(){
		if(this.preRunCheck){
			return this.preRunCheck();
		}
		return  false;
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
			await this.run();
			await this._markAsComplete();
			out.result = this.result = 'RUN';
			out.ranFor = this.ranFor;
			return out
		}catch(error){
			this.result = 'ERROR';
			this.error  = error;
			await this.log({event_type:'error'});
			throw error;
		}
	}
}
module.exports = Task;







