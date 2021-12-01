// content of index.js
import http from 'http'
import fs from 'fs'
import registry from './example'
import db from './db'
import { Task, getTreeJSON, Node } from '../index'
const port = 3000
function serveFile(response): void {
	fs.readFile( __dirname+'/index.html', 'UTF-8',function (err,str) {
		response.end(str);
	})
}
const TASK_NAME = 'RouteExample'
async function start(): Promise<void>{
	console.log('START')
	function logProgress(task: Task): void{
		console.log('Progress:',task.runId, task.name, task.result || task.error, task._status())
	}
	try{
		registry.on('progress', logProgress)
		const res = await registry.runTask(TASK_NAME)
		console.log(res)
	}catch(error){
		console.log(error,'ERROR OUT');
	}finally{
		registry.off('progress', logProgress)
	}
}

function getData(node: Node<Task>): any{
	const data = getTreeJSON(node)
	return {
		...data,
		nodes:data.nodes.map(function(node){
			return {
				...node,
				label:node.name+'\nDEPTH:'+node.depth+'\n'+node.status+'\nRUN: '+node.tier,
			}
		})
	}
}

const requestHandler = async (request, response): Promise<void> => {
	const {url,method} = request;
	if(method === 'GET' && url == '/'){
		serveFile(response)
		return 
	}
	console.log(url)
	try{
		switch(url){
			case '/data':{
				try{
					const tm = registry.getTaskRun(TASK_NAME)
					const node = tm ? tm.routeNode : undefined
					const data = node ? getData(node) : {};
					response.end(JSON.stringify(data, null, 2));
					return
				}catch(error){
					console.log(error);
					response.end('{}')
					return
				}
			}
			case '/reset':{
				await db.clear()
				if(!registry.getRunning(TASK_NAME)){
					start();
				}
				break;
			}
			case '/start':{
				if(!registry.getRunning(TASK_NAME)){
					start();
				}
				break;
			}
		}
		response.end('{}')
	}catch(error){
		console.log(error)
		response.end('{}')
	}
}

const server = http.createServer(requestHandler)
server.listen(port, () => {
  console.log(`server is listening on ${port}`)
});


