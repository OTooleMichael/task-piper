import {v4 as uuid} from 'uuid'
import { ResultState } from './types'
interface MinTaskDesc {
	name: string;
}
export default class Node {
	data: any;
	depth: number;
	path: Node[];
	id: string;
	name: string;
	isCircular: boolean;
	hasError: boolean;
	children: Node[];
	edges: NodeEdge[];
	tier?: number;
	status?: ResultState;
	parent?: Node;
	constructor( data: any, parent?: Node ){
		const { name } = data
		if(!name){
			throw new Error('name is required');
		}
		this.data = data;
		this.parent = parent;
		if(parent){
			this.depth = parent.depth + 1;
			this.path = parent.path.concat(parent);
			this.hasError = parent.hasError
		}else{
			this.depth = 0;
			this.path = []
		}
		this.id = uuid();
		this.name = name;
		this.isCircular = this.path.map(p=>p.name).includes(name);
		this.hasError = this.isCircular;
		this.children = [];
		this.edges = [];
		return this;
	}
	getParentNextSib(i: number): Node | undefined{
		if(!this.parent){
			return
		}
		const next = this.parent.getSib(i);
		if(next){
			return next;
		}
		return this.parent.getParentNextSib(i);
	}
	distanceFromLeaf(): number{
		let max = 0;
		this.children.forEach(function(child) {
			const val = child.distanceFromLeaf() + 1;
			if(val > max){
				max = val;
			}
		});
		return max
	}
	getSib(i: number): Node | undefined{
		if(!this.parent){
			return
		}
		const index = this.parent.children.findIndex(child=>child === this);
		return this.parent.children[index  +  i];
	}
	getLastLeafChild(): Node | undefined{
		let child = this.getLastChild()
		while( child && child.getLastChild() ){
			child = child.getLastChild()
		}
		return child
	}
	getLastChild(): Node | undefined{
		const len = this.children.length 
		return len > 0 ? this.children[len - 1] : undefined;
	}
	addChild(data): this{
		const child = new Node(data,this);
		return this.addChildNode(child);
	}
	addChildNode(child: Node): this{
		if(this.children.map(c=>c.name).includes(child.name)){
			throw new Error('Duplicate Child: '+child.name);
		}
		if(child.parent !== this){
			throw new Error('Cant add Child to other Patrent: '+child.name);
		}
		this.edges.push({
			parentId:this.id,
			parent:this,
			childId:child.id,
			child:child
		})
		this.children.push(child)
		return this
	}
	next(): Node | undefined{
		if(this.children.length){
			return this.children[0];
		}
		const sibling = this.getSib(1);
		if(sibling){
			return sibling;
		}
		return this.getParentNextSib(1);
	}
	prev(): Node | undefined{
		const sibling = this.getSib(-1);
		if(!sibling) return this.parent;
		return sibling.getLastLeafChild() || this.parent;
	}
	traverse(fn: (node: Node, i: number) => void ): void{
		let node: Node | undefined = undefined || this;
		let i = 0;
		while(node){
			fn(node,i);
			node = node.next();
			i++;
		}
	}
}
interface NodeEdge {
	parentId: string;
	parent: Node;
	childId: string;
	child: Node;
}
