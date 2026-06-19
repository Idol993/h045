"use strict";
(function () {
    var TILE = window.TILE || 32;

    class TowerSystem {
        constructor() {
            this.towers = [];
            this.projectiles = [];
            this.projPool = new ObjectPool(
                function () { return new Projectile(); },
                function (p, opts) { if (opts) p.reset(opts); },
                100
            );
            this.spatialGrid = new Map();
            this.towerCounter = 0;
        }

        init() {
            this.towers = [];
            this.projectiles = [];
            this.spatialGrid.clear();
            this.towerCounter = 0;
        }

        placeTower(gx, gy, type) {
            if (!GameMap.isPlaceable(gx, gy)) return false;
            if (this.getTowerAt(gx, gy)) return false;
            var cost = TOWER_CONFIG[type].levels[0].cost;
            if (GameEngine.state.gold < cost) return false;
            GameEngine.state.gold -= cost;

            var prevVal = GameMap.grid[gy][gx];
            GameMap.setCell(gx, gy, 1);
            PathManager.currentPath = null;

            if (!this._checkConnectivity()) {
                GameMap.setCell(gx, gy, prevVal);
                PathManager.currentPath = null;
                GameEngine.state.gold += cost;
                return false;
            }

            var tower = new Tower(gx, gy, type);
            tower.id = ++this.towerCounter;
            this.towers.push(tower);
            this._registerSpatial(tower);
            EventBus.emit('gold-change', GameEngine.state.gold);
            EventBus.emit('tower-placed', tower);
            ParticleSystem.spawn(tower.x, tower.y, {
                count: 15,
                color: TOWER_CONFIG[type].color,
                speed: 60,
                life: 0.4,
                size: 2
            });
            window.ReplayRecorder.safeRecord('recordEvent', 'tower_place', { id: tower.id, type: type, gx: gx, gy: gy });
            return true;
        }

        _checkConnectivity() {
            if (!GameMap || !GameMap.start || !GameMap.end) return true;
            var start = GameMap.start;
            var end = GameMap.end;
            var cols = GameMap.cols;
            var rows = GameMap.rows;
            var grid = GameMap.grid;

            var visited = new Array(rows);
            for (var y = 0; y < rows; y++) {
                visited[y] = new Array(cols);
                for (var x = 0; x < cols; x++) visited[y][x] = false;
            }

            var queue = [{ x: start.x, y: start.y }];
            visited[start.y][start.x] = true;
            var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

            while (queue.length > 0) {
                var cur = queue.shift();
                if (cur.x === end.x && cur.y === end.y) return true;
                for (var i = 0; i < dirs.length; i++) {
                    var nx = cur.x + dirs[i][0];
                    var ny = cur.y + dirs[i][1];
                    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                    if (visited[ny][nx]) continue;
                    var v = grid[ny][nx];
                    if (v !== 0 && v !== 3 && v !== 4) continue;
                    visited[ny][nx] = true;
                    queue.push({ x: nx, y: ny });
                }
            }
            return false;
        }

        removeTower(tower) {
            GameMap.setCell(tower.gx, tower.gy, 2);
            PathManager.currentPath = null;
            var idx = this.towers.indexOf(tower);
            if (idx >= 0) this.towers.splice(idx, 1);
            this._unregisterSpatial(tower);
            GameEngine.addGold(tower.sellValue());
            EventBus.emit('tower-removed', tower);
            window.ReplayRecorder.safeRecord('recordEvent', 'tower_remove', {id: tower.id, gx: tower.gx, gy: tower.gy});
        }

        getTowerAt(gx, gy) {
            for (var i = 0; i < this.towers.length; i++) {
                var t = this.towers[i];
                if (t.gx === gx && t.gy === gy) return t;
            }
            return null;
        }

        _registerSpatial(tower) {
            var cs = 64, r = tower.rangePx;
            var minX = Math.floor((tower.x - r) / cs), maxX = Math.floor((tower.x + r) / cs);
            var minY = Math.floor((tower.y - r) / cs), maxY = Math.floor((tower.y + r) / cs);
            for (var cx = minX; cx <= maxX; cx++) {
                for (var cy = minY; cy <= maxY; cy++) {
                    var key = cx + ',' + cy;
                    if (!this.spatialGrid.has(key)) this.spatialGrid.set(key, []);
                    this.spatialGrid.get(key).push(tower);
                }
            }
            tower._spatialKeys = this._getSpatialKeys(tower);
        }

        _unregisterSpatial(tower) {
            var keys = tower._spatialKeys || [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var arr = this.spatialGrid.get(key);
                if (arr) {
                    var idx = arr.indexOf(tower);
                    if (idx >= 0) arr.splice(idx, 1);
                }
            }
        }

        _getSpatialKeys(tower) {
            var keys = [], cs = 64, r = tower.rangePx;
            var minX = Math.floor((tower.x - r) / cs), maxX = Math.floor((tower.x + r) / cs);
            var minY = Math.floor((tower.y - r) / cs), maxY = Math.floor((tower.y + r) / cs);
            for (var cx = minX; cx <= maxX; cx++) {
                for (var cy = minY; cy <= maxY; cy++) {
                    keys.push(cx + ',' + cy);
                }
            }
            return keys;
        }

        spawnProjectile(opts) {
            var p;
            try {
                p = this.projPool.acquire(opts);
            } catch (e) {
                p = new Projectile();
                p.reset(opts);
                p._active = true;
            }
            if (this.projectiles.length >= 100) this.projectiles.shift();
            this.projectiles.push(p);
        }

        update(dt) {
            for (var i = 0; i < this.towers.length; i++) {
                this.towers[i].update(dt);
            }
            for (var j = 0; j < this.projectiles.length; j++) {
                this.projectiles[j].update(dt);
            }
            this.projectiles = this.projectiles.filter(function (p) { return p._active; });
        }

        render(ctx) {
            for (var i = 0; i < this.towers.length; i++) {
                this.towers[i].render(ctx);
            }
        }

        renderProjectiles(ctx) {
            for (var i = 0; i < this.projectiles.length; i++) {
                this.projectiles[i].render(ctx);
            }
        }
    }

    window.TowerSystem = new TowerSystem();
})();
