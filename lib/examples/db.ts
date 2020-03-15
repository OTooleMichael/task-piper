import fs from 'fs'
import ndjson from 'ndjson';

const FILE = './db.json';
export interface LogEvent {
	event: string;
	loggedAt: Date;
	name: string;
	runTime?: Date;
}
interface FindParams {
	limit?: number;
	match(d: LogEvent): boolean;
}
function write(payload: LogEvent): Promise<void>{
	const logLine = JSON.stringify(payload);
	return new Promise(function(resolve,reject) {
		fs.appendFile(FILE, logLine+'\n', function (err) {
			return err ? reject(err) : resolve()
		});
	});
}
function find(params: FindParams): Promise<LogEvent[]>{
	const {match, limit} = params
	let stream = fs.createReadStream(FILE, {encoding: 'utf8'});
	const values: LogEvent[] = [];
	stream = stream.pipe(ndjson.parse())
	return new Promise(function(resolve,reject) {
		stream.on('error',function(e){
			return reject(e)
		}).on('data', function(obj: LogEvent) {
			if(limit && values.length >= limit){
				return
			}
			const isMatch = match(obj);
			if(isMatch){
				values.push(obj);
			}
		}).on('finish',function() {
			return resolve(values)
		})
	});
}
export default {
	find, write
}