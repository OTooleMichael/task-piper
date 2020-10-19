// content of index.js
import http from 'http'
import fs from 'fs'
import registry from './example'
import Node from '../Node';
import db from './db'
import { Task } from '../index'
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
		console.log('Progress:',task.runId,task.name,task.result)
	}
	try{
		registry.on('progress',logProgress)
		const res = await registry.runTask(TASK_NAME)
		console.log(res)
	}catch(error){
		console.log(error,'ERROR OUT');
	}finally{
		registry.off('progress',logProgress)
	}
}
interface NodeData {
	id: string;
	nodes: any[];
	edges: any[];
}
interface EdgeData {
	to: string;
	from: string;
}
function getData(tree: Node<Task>): NodeData{
	const nodes = [tree];
	let node: Node<Task> | undefined = tree;
	let edges: EdgeData[] = [];
	while(node && node.next()){
		node = node.next();
		nodes.push(node as Node<Task>)
	}
	nodes.sort((a,b)=>a.depth > b.depth ? -1 : 1);
	const nodesData = nodes.map(function(node){
		const status = node.data._status();
		edges = node.edges.map(e=>{
			return {to:e.parentId, from:e.childId};
		}).concat(edges);
		const tier = node.distanceFromLeaf();
		const colors = {
			'PENDING':'orange',
			'RUN':'green',
			'RUNNING':'lightblue',
			'IS_ALREADY_COMPLETE':'green',
		};
		return {
			id:node.id,
			label:node.name+'\nDEPTH:'+node.depth+'\n'+status+'\nRUN: '+tier,
			name:node.name,
			status,
			tier,
			depth:node.depth,
			color:colors[status] || 'grey'
		}
	});
	return {
		id:tree.data.runId,
		nodes:nodesData,
		edges
	}
}
const requestHandler = async (request, response): Promise<void> => {
	const {url,method} = request;
	if(method === 'GET' && url == '/'){
		serveFile(response)
		return 
	}
	switch(url){
		case '/data':{
			try{
				const tm = registry.getTaskRun(TASK_NAME)
				const node = tm ? tm.routeNode : undefined
				const data = node ? getData(node) : {};
				response.end(JSON.stringify(data,null,2));
				return
			}catch(error){
				console.log(error);
				response.end('{}')
				return
			}
		}
		case '/reset':{
			await db.clear()
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
}

const server = http.createServer(requestHandler)
server.listen(port, () => {
  console.log(`server is listening on ${port}`)
});


