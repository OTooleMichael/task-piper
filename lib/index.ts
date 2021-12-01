import Task from './Task'
import TaskManager from './TaskManager'
import Registry from './Registry'
import Node from './Node';
import { ResultState } from './types';

interface NodeData {
    id: string;
    name: string;
    status: ResultState;
    tier: number;
    depth: number;
    color: string;
}
interface EdgeData {
	to: string;
	from: string;
}

interface NodeTreeData {
	id: string;
	nodes: NodeData[];
	edges: EdgeData[];
}

const colors: Record<ResultState, string> = {
    'PENDING':'orange',
    'RUN':'green',
    'RUNNING':'lightblue',
    'IS_ALREADY_COMPLETE':'green',
    'ERROR':'red',
    'INITIALISED': 'grey',
    'NOT_TO_BE_RUN': 'grey'
}


function getTreeJSON(tree: Node<Task>): NodeTreeData{
	const nodes = [tree];
	let node: Node<Task> | undefined = tree;
	let edges: EdgeData[] = [];
	while(node && node.next()){
		node = node.next();
		nodes.push(node as Node<Task>)
	}
	nodes.sort((a,b)=>a.depth > b.depth ? -1 : 1);
	const duplicates = {}
	const nodesData = nodes.map(function(node): NodeData | undefined{
		const status = node.data._status();
		const duplicateOf = node.duplicateOf
		edges = node.edges.map(e=>{
			return {to:e.parentId, from:e.childId};
		}).concat(edges);
		if(duplicateOf){
			duplicates[node.id] = duplicateOf
			return
		}
		const tier = node.distanceFromLeaf();
		return {
			id:node.id,
			name:node.name,
			status,
			tier,
			depth:node.depth,
			color:colors[status] || 'grey'
		}
	}).filter(v=>v) as NodeData[]
	return {
		id: tree.data.runId,
		nodes: nodesData,
		edges: edges.map(function(e){
			return {
				to:duplicates[e.to] || e.to,
				from:duplicates[e.from] || e.from,
			}
		})
	}
}




export { TaskManager, Task, Registry, getTreeJSON, ResultState, Node }
