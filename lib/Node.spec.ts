import Node from './Node'


describe('Node module',function(){
	it('A Single Node is a tree of one',function(){
		const node = new Node({ name:'lemon' })
		expect(node.depth).toBe(0)
		expect(node.distanceFromLeaf()).toBe(0)
		expect(node.isCircular).toBe(false)
		expect(node.prev()).toBeUndefined()
		expect(node.next()).toBeUndefined()
	})
	it('A Two Node',function(){
		const parent = new Node({name:'parent'})
		const child = new Node({name:'child'},parent)		
		parent.addChildNode(child)
		expect(parent.depth).toBe(0)
		expect(parent.distanceFromLeaf()).toBe(1)
		expect(child.depth).toBe(1)
		expect(child.distanceFromLeaf()).toBe(0)
		expect(parent.isCircular).toBe(false)
		expect(parent.prev()).toBeUndefined()
		expect(parent.next()).toBe(child)
	})
	it('A Complex Node Tree',function(){
		const parent = new Node({name:'parent'})
		const childA = new Node({name:'childA'},parent)
		const childB = new Node({name:'childB'},parent)
		const childC = new Node({name:'childC'},childA)
		parent.addChildNode(childA)
		parent.addChildNode(childB)
		childA.addChildNode(childC)
		expect(parent.depth).toBe(0)
		expect(parent.distanceFromLeaf()).toBe(2)
		expect(childA.distanceFromLeaf()).toBe(1)
		expect(parent.isCircular).toBe(false)
		expect(parent.prev()).toBeUndefined()
		expect(parent.next()).toBe(childA)
		const names: string[] = []
		parent.traverse(function(node){
			names.push(node.name)
		})
		expect(new Set(names)).toEqual(new Set(['parent','childA','childC','childB']))
		expect(childC.path).toEqual([parent,childA])
	})
	it('Nodes Require a name',function(){
		expect(()=>new Node({})).toThrowError()
	})
	it('Nodes cant be added to itself',function(){
		const parent = new Node({name:'parent'})
		expect(()=>parent.addChildNode(parent)).toThrowError()
	})
})







