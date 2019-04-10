const fs = require('fs');
const ndjson = require('ndjson')
const FILE = './db.json';
function write(payload){
	payload = JSON.stringify(payload);
	return new Promise(function(resolve,reject) {
		fs.appendFile(FILE, payload+'\n', function (err) {
		  return err ? reject(err) : resolve()
		});
	});
}
function find({match,limit}){
	let stream = fs.createReadStream(FILE, {encoding: 'utf8'});
	let values = [];
	stream = stream.pipe(ndjson.parse())
	return new Promise(function(resolve,reject) {
		stream.on('error',function(e){
			console.log(e)
		}).on('data', function(obj) {
			if(limit && values.length >= limit){
				return
			}
			let isMatch = match(obj);
			if(isMatch){
				values.push(obj);
			};
		}).on('finish',function(argument) {
			return resolve(values)
		})
	});
}
module.exports = {
	write,
	find
};