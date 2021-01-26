import { ResultState } from './types';
export default class Node<T> {
    data: T;
    depth: number;
    path: Node<T>[];
    id: string;
    name: string;
    isCircular: boolean;
    hasError: boolean;
    children: Node<T>[];
    edges: NodeEdge<T>[];
    tier?: number;
    status?: ResultState;
    parent?: Node<T>;
    constructor(data: ({
        name?: string;
    } & T), parent?: Node<T>);
    getParentNextSib(i: number): Node<T> | undefined;
    distanceFromLeaf(): number;
    getSib(i: number): Node<T> | undefined;
    getLastLeafChild(): Node<T> | undefined;
    getLastChild(): Node<T> | undefined;
    addChild(data: any): this;
    addChildNode(child: Node<T>): this;
    next(): Node<T> | undefined;
    prev(): Node<T> | undefined;
    traverse(fn: (node: Node<T>, i: number) => void): void;
}
interface NodeEdge<T> {
    parentId: string;
    parent: Node<T>;
    childId: string;
    child: Node<T>;
}
export {};
