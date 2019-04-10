const { Task, TaskManager } = require('../index')
const db = require('./db');

class ProjectTask extends Task {
	constructor(options){
		super(options);
		this.db = db;
		this.cutOffTime = 1000*60*15
	}
	async checkLastRun(){
		const { cutOffTime, runTime, name} = this;
		let minTime = new Date(runTime - cutOffTime);
		let rows = await db.find({match:function(row) {
			let {loggedAt} = row;
			return name == row.name && new Date(loggedAt) > minTime;
		}});
		this.lastRuns = rows;
		rows.sort((a,b)=>a.loggedAt > b.loggedAt ? 1 : -1);
		let last = rows.pop();
		return last
	}
	async isComplete(){
		let lastRun = await this.checkLastRun();
		this.lastRun = lastRun;
		return lastRun && lastRun.event == 'completed'
	}
	async log({event}){
		let {id,name,runTime,options} = this;
		return db.write({
			loggedAt:new Date(),
			event,
			name,
			id,
			runTime
		})
	}
}
module.exports = ProjectTask;

