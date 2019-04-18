// content of index.js
const http = require('http')
const fs = require('fs')
const {TaskManager,RouteExample,makeTask} = require('./example')
const port = 3000
let tm = null
function serveFile(response){
	fs.readFile('./examples/index.html','UTF-8',function (err,str) {
		response.end(str);
	})
}
const requestHandler = async (request, response) => {
  const {url,method} = request;
  if(!tm){
	start();
  }
  if(method === 'GET' && url == '/'){
  	return serveFile(response)
  }
  let parts = url.split('/').filter(v=>v);
  if(url == '/data'){
  	try{
	  	let data = getData(tm.routeNode)
	  	return response.end(JSON.stringify(data));
	  }catch(error){
	  	console.log(error);
	  	return response.end('{}');
	  }
  }
  response.end('')
}
async function start(){
	try{
		tm = makeTask();
		let res = await tm.runTask(RouteExample,{});
	}catch(error){
		console.log(error);
		tm = null
	}
}
function getData(tree){
	let nodes = [tree];
	let node = tree;
	let edges = [];
	while(node.next()){
		let name = node.name;
		node = node.next();
		nodes.push(node)
	}
	nodes.sort((a,b)=>a.depth > b.depth ? -1 : 1);
	nodes = nodes.map(function(node) {
		let { id,name } = node;
		let status = node.data._status();
		edges = node.edges.map(e=>{
			return {to:e.parentId, from:e.childId};
		}).concat(edges);
		let tier = node.distanceFromLeaf();
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
			color:colors[status] || 'grey'
		}
	});
	return {
		id:tree.data.runId,
		nodes,
		edges
	}
}


const server = http.createServer(requestHandler)
server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
});


