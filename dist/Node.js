"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var Node = /** @class */ (function () {
    function Node(data, parent) {
        var name = data.name;
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
        this.isCircular = this.path.map(function (p) { return p.name; }).includes(name);
        this.hasError = this.isCircular;
        this.children = [];
        this.edges = [];
        return this;
    }
    Node.prototype.getParentNextSib = function (i) {
        if (!this.parent) {
            return;
        }
        var next = this.parent.getSib(i);
        if (next) {
            return next;
        }
        return this.parent.getParentNextSib(i);
    };
    Node.prototype.distanceFromLeaf = function () {
        var max = 0;
        this.children.forEach(function (child) {
            var val = child.distanceFromLeaf() + 1;
            if (val > max) {
                max = val;
            }
        });
        return max;
    };
    Node.prototype.getSib = function (i) {
        var _this = this;
        if (!this.parent) {
            return;
        }
        var index = this.parent.children.findIndex(function (child) { return child === _this; });
        return this.parent.children[index + i];
    };
    Node.prototype.getLastLeafChild = function () {
        var child = this.getLastChild();
        while (child && child.getLastChild()) {
            child = child.getLastChild();
        }
        return child;
    };
    Node.prototype.getLastChild = function () {
        var len = this.children.length;
        return len > 0 ? this.children[len - 1] : undefined;
    };
    Node.prototype.addChild = function (data) {
        var child = new Node(data, this);
        return this.addChildNode(child);
    };
    Node.prototype.addChildNode = function (child) {
        if (this.children.map(function (c) { return c.name; }).includes(child.name)) {
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
    };
    Node.prototype.next = function () {
        if (this.children.length) {
            return this.children[0];
        }
        var sibling = this.getSib(1);
        if (sibling) {
            return sibling;
        }
        return this.getParentNextSib(1);
    };
    Node.prototype.prev = function () {
        var sibling = this.getSib(-1);
        if (!sibling)
            return this.parent;
        return sibling.getLastLeafChild() || this.parent;
    };
    Node.prototype.traverse = function (fn) {
        var node = undefined || this;
        var i = 0;
        while (node) {
            fn(node, i);
            node = node.next();
            i++;
        }
    };
    return Node;
}());
exports.default = Node;
