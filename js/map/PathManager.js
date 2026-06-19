"use strict";
(function () {
    var TILE = (window.LEVEL_CONFIG && window.LEVEL_CONFIG.TILE) || 32;

    var workerCode = [
        '"use strict";',
        'onmessage = function(e) {',
        '    var data = e.data;',
        '    var id = data.id;',
        '    var start = data.start;',
        '    var end = data.end;',
        '    var grid = data.grid;',
        '    var cols = data.cols;',
        '    var rows = data.rows;',
        '    var path = astar(start, end, grid, cols, rows);',
        '    postMessage({ id: id, path: path });',
        '};',
        'function astar(start, end, grid, cols, rows) {',
        '    function inBounds(x, y) {',
        '        return x >= 0 && x < cols && y >= 0 && y < rows;',
        '    }',
        '    function isWalkable(x, y) {',
        '        if (!inBounds(x, y)) return false;',
        '        var v = grid[y][x];',
        '        return v === 0 || v === 3 || v === 4;',
        '    }',
        '    function heuristic(a, b) {',
        '        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);',
        '    }',
        '    function nodeKey(n) {',
        '        return n.x + "," + n.y;',
        '    }',
        '    if (!isWalkable(start.x, start.y) || !isWalkable(end.x, end.y)) {',
        '        return [];',
        '    }',
        '    var startNode = { x: start.x, y: start.y, g: 0, h: heuristic(start, end), f: 0, parent: null };',
        '    startNode.f = startNode.g + startNode.h;',
        '    var open = [startNode];',
        '    var closed = new Set();',
        '    var openMap = new Map();',
        '    openMap.set(nodeKey(startNode), startNode);',
        '    var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];',
        '    while (open.length > 0) {',
        '        open.sort(function(a, b) { return a.f - b.f; });',
        '        var current = open.shift();',
        '        var curKey = nodeKey(current);',
        '        openMap.delete(curKey);',
        '        if (current.x === end.x && current.y === end.y) {',
        '            var path = [];',
        '            var node = current;',
        '            while (node) {',
        '                path.unshift({ x: node.x, y: node.y });',
        '                node = node.parent;',
        '            }',
        '            return path;',
        '        }',
        '        closed.add(curKey);',
        '        for (var i = 0; i < dirs.length; i++) {',
        '            var nx = current.x + dirs[i][0];',
        '            var ny = current.y + dirs[i][1];',
        '            if (!isWalkable(nx, ny)) continue;',
        '            var neighborKey = nx + "," + ny;',
        '            if (closed.has(neighborKey)) continue;',
        '            var tentativeG = current.g + 1;',
        '            var neighbor = openMap.get(neighborKey);',
        '            if (!neighbor) {',
        '                neighbor = {',
        '                    x: nx, y: ny,',
        '                    g: tentativeG,',
        '                    h: heuristic({x:nx,y:ny}, end),',
        '                    f: 0,',
        '                    parent: current',
        '                };',
        '                neighbor.f = neighbor.g + neighbor.h;',
        '                open.push(neighbor);',
        '                openMap.set(neighborKey, neighbor);',
        '            } else if (tentativeG < neighbor.g) {',
        '                neighbor.g = tentativeG;',
        '                neighbor.f = neighbor.g + neighbor.h;',
        '                neighbor.parent = current;',
        '            }',
        '        }',
        '    }',
        '    return [];',
        '}'
    ].join('\n');

    function PathManager() {
        this.worker = null;
        this.pendingRequests = new Map();
        this.reqIdCounter = 0;
        this.currentPath = null;
        this.initWorker();
    }

    PathManager.prototype.initWorker = function () {
        try {
            var blob = new Blob([workerCode], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
        } catch (e) {
            this.worker = null;
        }
        var self = this;
        if (this.worker) {
            this.worker.onmessage = function (e) {
                var id = e.data.id;
                var path = e.data.path;
                var req = self.pendingRequests.get(id);
                if (req) {
                    var elapsed = performance.now() - req.t0;
                    if (window.PerfMonitor && typeof window.PerfMonitor.prototype.recordPathTime === 'function') {
                        var pm = window.__perfMonitor || (window.game && window.game.perfMonitor);
                        if (pm && pm.recordPathTime) pm.recordPathTime(elapsed);
                    }
                    if (window.GameMap) {
                        var cacheKey = req.start.x + ',' + req.start.y + '-' + req.end.x + ',' + req.end.y;
                        window.GameMap.pathCache.set(cacheKey, path.slice());
                    }
                    req.callback(path);
                    self.pendingRequests.delete(id);
                }
            };
        }
    };

    PathManager.prototype.requestPath = function (start, end, callback) {
        var cacheKey = start.x + ',' + start.y + '-' + end.x + ',' + end.y;
        if (window.GameMap && window.GameMap.pathCache.has(cacheKey)) {
            var cached = window.GameMap.pathCache.get(cacheKey);
            callback(cached.slice());
            return;
        }
        if (!this.worker) {
            callback([]);
            return;
        }
        var id = ++this.reqIdCounter;
        this.pendingRequests.set(id, {
            callback: callback,
            start: { x: start.x, y: start.y },
            end: { x: end.x, y: end.y },
            t0: performance.now()
        });
        this.worker.postMessage({
            id: id,
            start: { x: start.x, y: start.y },
            end: { x: end.x, y: end.y },
            grid: window.GameMap ? window.GameMap.grid : [],
            cols: window.GameMap ? window.GameMap.cols : 25,
            rows: window.GameMap ? window.GameMap.rows : 16
        });
    };

    PathManager.prototype.getMainPath = function (callback) {
        if (this.currentPath && this.currentPath.length > 0) {
            callback(this.currentPath.slice());
            return;
        }
        if (!window.GameMap || !window.GameMap.start || !window.GameMap.end) {
            callback([]);
            return;
        }
        var self = this;
        this.requestPath(window.GameMap.start, window.GameMap.end, function (p) {
            self.currentPath = p;
            callback(p.slice());
        });
    };

    PathManager.prototype.gridPathToWorld = function (path) {
        var result = [];
        for (var i = 0; i < path.length; i++) {
            result.push({
                x: path[i].x * TILE + TILE / 2,
                y: path[i].y * TILE + TILE / 2
            });
        }
        return result;
    };

    PathManager.prototype.recalcForEnemy = function (enemy, callback) {
        if (!window.GameMap || !window.GameMap.end) {
            callback([]);
            return;
        }
        var mainKey = window.GameMap.start.x + ',' + window.GameMap.start.y + '-' + window.GameMap.end.x + ',' + window.GameMap.end.y;
        if (window.GameMap.pathCache.has(mainKey)) {
            window.GameMap.pathCache.delete(mainKey);
        }
        this.currentPath = null;
        var gx = Math.floor(enemy.x / TILE);
        var gy = Math.floor(enemy.y / TILE);
        if (window.GameMap && !window.GameMap.isWalkable(gx, gy)) {
            for (var dy = -1; dy <= 1; dy++) {
                for (var dx = -1; dx <= 1; dx++) {
                    if (window.GameMap.isWalkable(gx + dx, gy + dy)) {
                        gx += dx;
                        gy += dy;
                        break;
                    }
                }
            }
        }
        var start = { x: gx, y: gy };
        var self = this;
        this.requestPath(start, window.GameMap.end, function (p) {
            callback(p);
        });
    };

    window.PathManager = new PathManager();
})();
