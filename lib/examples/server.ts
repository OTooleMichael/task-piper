// content of index.js
import http from 'http'
import fs from 'fs'
import { RouteExample,makeTask } from './example'
import Node from '../Node';
const port = 3000
let tm: any = null
function serveFile(response): void {
	fs.readFile( __dirname+'/index.html', 'UTF-8',function (err,str) {
		response.end(str);
	})
}

async function start(): Promise<void>{
	try{
		tm = makeTask();
		tm.on('progress',function(task){
			console.log(task.runId,task.name,task.result)
		})
		await tm.runTask(RouteExample,{});
	}catch(error){
		console.log(error,'ERROR OUT');
		tm = null
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
function getData(tree: Node): NodeData{
	const nodes = [tree];
	let node: Node | undefined = tree;
	let edges: EdgeData[] = [];
	while(node && node.next()){
		node = node.next();
		nodes.push(node as Node)
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
	if(!tm){
		start();
	}
	if(method === 'GET' && url == '/'){
		serveFile(response)
		return 
	}
	if(url == '/data'){
		try{
			const data = getData(tm.routeNode)
			response.end(JSON.stringify(data,null,2));
			return
		}catch(error){
			console.log(error);
			response.end('{}')
			return
		}
	}
	response.end('')
}

const server = http.createServer(requestHandler)
server.listen(port, () => {
  console.log(`server is listening on ${port}`)
});


