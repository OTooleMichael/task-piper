"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = __importDefault(require("./Node"));
describe('Node module', function () {
    it('A Single Node is a tree of one', function () {
        const node = new Node_1.default({ name: 'lemon' });
        expect(node.depth).toBe(0);
        expect(node.distanceFromLeaf()).toBe(0);
        expect(node.isCircular).toBe(false);
        expect(node.prev()).toBeUndefined();
        expect(node.next()).toBeUndefined();
    });
    it('A Two Node', function () {
        const parent = new Node_1.default({ name: 'parent' });
        const child = new Node_1.default({ name: 'child' }, parent);
        parent.addChildNode(child);
        expect(parent.depth).toBe(0);
        expect(parent.distanceFromLeaf()).toBe(1);
        expect(child.depth).toBe(1);
        expect(child.distanceFromLeaf()).toBe(0);
        expect(parent.isCircular).toBe(false);
        expect(parent.prev()).toBeUndefined();
        expect(parent.next()).toBe(child);
    });
    it('A Complex Node Tree', function () {
        const parent = new Node_1.default({ name: 'parent' });
        const childA = new Node_1.default({ name: 'childA' }, parent);
        const childB = new Node_1.default({ name: 'childB' }, parent);
        const childC = new Node_1.default({ name: 'childC' }, childA);
        parent.addChildNode(childA);
        parent.addChildNode(childB);
        childA.addChildNode(childC);
        expect(parent.depth).toBe(0);
        expect(parent.distanceFromLeaf()).toBe(2);
        expect(childA.distanceFromLeaf()).toBe(1);
        expect(parent.isCircular).toBe(false);
        expect(parent.prev()).toBeUndefined();
        expect(parent.next()).toBe(childA);
        const names = [];
        parent.traverse(function (node) {
            names.push(node.name);
        });
        expect(new Set(names)).toEqual(new Set(['parent', 'childA', 'childC', 'childB']));
        expect(childC.path).toEqual([parent, childA]);
    });
    it('Nodes Require a name', function () {
        expect(() => new Node_1.default({})).toThrowError();
    });
    it('Nodes cant be added to itself', function () {
        const parent = new Node_1.default({ name: 'parent' });
        expect(() => parent.addChildNode(parent)).toThrowError();
    });
});
