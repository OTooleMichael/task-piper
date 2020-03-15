"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Node {
    constructor(data, parent) {
        const { name } = data;
        if (!name) {
            throw new Error('name is required');
        }
        this.data = data;
        this.parent = parent;
        if (parent) {
            this.depth = parent.depth + 1;
            this.path = parent.path.concat(parent);
            this.hasError = parent.hasError;
        }
        else {
            this.depth = 0;
            this.path = [];
        }
        this.id = uuid_1.v4();
        this.name = name;
        this.isCircular = this.path.map(p => p.name).includes(name);
        this.hasError = this.isCircular;
        this.children = [];
        this.edges = [];
        return this;
    }
    getParentNextSib(i) {
        if (!this.parent) {
            return;
        }
        const next = this.parent.getSib(i);
        if (next) {
            return next;
        }
        return this.parent.getParentNextSib(i);
    }
    distanceFromLeaf() {
        let max = 0;
        this.children.forEach(function (child) {
            const val = child.distanceFromLeaf() + 1;
            if (val > max) {
                max = val;
            }
        });
        return max;
    }
    getSib(i) {
        if (!this.parent) {
            return;
        }
        const index = this.parent.children.findIndex(child => child === this);
        return this.parent.children[index + i];
    }
    getLastLeafChild() {
        let child = this.getLastChild();
        while (child && child.getLastChild()) {
            child = child.getLastChild();
        }
        return child;
    }
    getLastChild() {
        const len = this.children.length;
        return len > 0 ? this.children[len - 1] : undefined;
    }
    addChild(data) {
        const child = new Node(data, this);
        return this.addChildNode(child);
    }
    addChildNode(child) {
        if (this.children.map(c => c.name).includes(child.name)) {
            throw new Error('Duplicate Child: ' + child.name);
        }
        if (child.parent !== this) {
            throw new Error('Cant add Child to other Patrent: ' + child.name);
        }
        this.edges.push({
            parentId: this.id,
            parent: this,
            childId: child.id,
            child: child
        });
        this.children.push(child);
        return this;
    }
    next() {
        if (this.children.length) {
            return this.children[0];
        }
        const sibling = this.getSib(1);
        if (sibling) {
            return sibling;
        }
        return this.getParentNextSib(1);
    }
    prev() {
        const sibling = this.getSib(-1);
        if (!sibling)
            return this.parent;
        return sibling.getLastLeafChild() || this.parent;
    }
    traverse(fn) {
        let node = undefined || this;
        let i = 0;
        while (node) {
            fn(node, i);
            node = node.next();
            i++;
        }
    }
}
exports.default = Node;
