const {init,Task,runTask } = require('./index')
const fs = require('fs');
const ndjson = require('ndjson')
const FILE = './db.json';
process.on('unhandledRejection', err => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandled Promise Rejection');
  console.log(err);

});
function wait(time=200){
	return new Promise(r=>setTimeout(r,time))
}
function dbSave(payload){
	payload = JSON.stringify(payload);
	return new Promise(function(resolve,reject) {
		fs.appendFile(FILE, payload+'\n', function (err) {
		  return err ? reject(err) : resolve()
		});
	});
}
function dbFind({task_id,event_type,logged_at}) {
	let stream = fs.createReadStream(FILE, {encoding: 'utf8'});
	let values = [];
	stream = stream.pipe(ndjson.parse())
	return new Promise(function(resolve,reject) {
		stream.on('error',function(e){
			console.log(e)
		}).on('data', function(obj) {
			obj.logged_at = new Date(obj.logged_at);
			if(obj.task_id !== task_id){
				return
			}
			if(obj.event_type !== event_type){
				return
			}
			if(obj.logged_at < logged_at){
				return
			}
			obj.refTime = logged_at;
			values.push(obj)
		}).on('finish',function(argument) {
			return resolve(values)
		})
	});
}
class Example extends Task {
	constructor(options){
		super(options)
		this.logName = 'Example';
	}
	* requires(){
		yield EChild3
		yield EChild2
		yield EChild4
	}
	async isComplete(){
		let values = await this._checkIsRequired()
		return !values.length
	}
	async run(){
		
		return 
	}
}	

class EChild extends Task {
	constructor(options){
		super(options);
		this.logName = 'EChild'
	}
	async isComplete(){
		let values = await this._dbFind({
    		task_id:this.logName,
    		event_type:'started',
    		logged_at:new Date("2019-01-06T18:14:20.479Z")
    	})
		return !values.length
	}
	async run(){
		
	}
}
class EChild2 extends Task {
	constructor(options){
		super(options);
		this.logName = 'EChild2'
	}
	requires(){
		return [
			EChild
		]
	}
	async isComplete(){
		let values = await this._dbFind({
    		task_id:this.logName,
    		event_type:'started',
    		logged_at:this.runTime // new Date("2019-01-06T18:14:20.479Z")
    	})
		return !values.length
	}
	async run(){
		
	}
}
class EChild4 extends Task {
	constructor(options){
		super(options);
		this.logName = 'EChild4'
	}
	requires(){
		return [
			EChild2,
			EChild3
		]
	}
	async isComplete(){
		let values = await this._checkIsRequired({newerThan:'2018-01-01'})
		return !values.length
	}
	async run(){
		await wait(500)
	}
}
class EChild3 extends Task {
	constructor(options){
		super(options);
		this.logName = 'EChild3'
	}
	* requires(){
		yield EChild
	}
	async isComplete(){
		let values = await this._dbFind({
    		task_id:this.logName,
    		event_type:'started',
    		logged_at:this.runTime // new Date("2019-01-06T18:14:20.479Z")
    	})
		return !values.length
	}
	async run(){
		
	}
}
async function start(){
	init({dbFind,dbSave})
	let res = await runTask(Example)
	console.log(res);
}
start()






