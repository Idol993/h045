"use strict";

onmessage = function (e) {
    var data = e.data;
    var id = data.id;
    var start = data.start;
    var end = data.end;
    var grid = data.grid;
    var cols = data.cols;
    var rows = data.rows;
    var path = astar(start, end, grid, cols, rows);
    postMessage({ id: id, path: path });
};

function astar(start, end, grid, cols, rows) {
    function inBounds(x, y) {
        return x >= 0 && x < cols && y >= 0 && y < rows;
    }

    function isWalkable(x, y) {
        if (!inBounds(x, y)) return false;
        var v = grid[y][x];
        return v === 0 || v === 3 || v === 4;
    }

    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    function nodeKey(n) {
        return n.x + "," + n.y;
    }

    if (!isWalkable(start.x, start.y) || !isWalkable(end.x, end.y)) {
        return [];
    }

    var startNode = {
        x: start.x,
        y: start.y,
        g: 0,
        h: heuristic(start, end),
        f: 0,
        parent: null
    };
    startNode.f = startNode.g + startNode.h;

    var open = [startNode];
    var closed = new Set();
    var openMap = new Map();
    openMap.set(nodeKey(startNode), startNode);

    var dirs = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0]
    ];

    while (open.length > 0) {
        open.sort(function (a, b) { return a.f - b.f; });

        var current = open.shift();
        var curKey = nodeKey(current);
        openMap.delete(curKey);

        if (current.x === end.x && current.y === end.y) {
            var path = [];
            var node = current;
            while (node) {
                path.unshift({ x: node.x, y: node.y });
                node = node.parent;
            }
            return path;
        }

        closed.add(curKey);

        for (var i = 0; i < dirs.length; i++) {
            var nx = current.x + dirs[i][0];
            var ny = current.y + dirs[i][1];

            if (!isWalkable(nx, ny)) continue;

            var neighborKey = nx + "," + ny;
            if (closed.has(neighborKey)) continue;

            var tentativeG = current.g + 1;
            var neighbor = openMap.get(neighborKey);

            if (!neighbor) {
                neighbor = {
                    x: nx,
                    y: ny,
                    g: tentativeG,
                    h: heuristic({ x: nx, y: ny }, end),
                    f: 0,
                    parent: current
                };
                neighbor.f = neighbor.g + neighbor.h;
                open.push(neighbor);
                openMap.set(neighborKey, neighbor);
            } else if (tentativeG < neighbor.g) {
                neighbor.g = tentativeG;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }
    }

    return [];
}
