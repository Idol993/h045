"use strict";
(function () {
    var TILE = 32;
    var WIDTH = 25 * TILE;
    var HEIGHT = 16 * TILE;

    class ReplayPlayer {
        constructor() {
            this.data = null;
            this.canvas = null;
            this.ctx = null;
            this.running = false;
            this.paused = false;
            this.currentTime = 0;
            this.speed = 1;
            this.enemies = new Map();
            this.towers = new Map();
            this.eventIndex = 0;
            this.tileSprites = {};
            this._rafId = null;
            this._lastTs = 0;
            this._onExitCallback = null;
            this._cachedMap = null;
        }

        init() {
            this.canvas = document.getElementById('replay-canvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = WIDTH * 2;
            this.canvas.height = HEIGHT * 2;
            this.ctx.scale(2, 2);
            this.ctx.imageSmoothingEnabled = false;

            if (typeof window.SpriteFactory !== 'undefined') {
                for (var i = 0; i <= 4; i++) {
                    try {
                        this.tileSprites[i] = window.SpriteFactory.generateTileSprite(i);
                    } catch (e) {}
                }
            }

            var self = this;
            document.getElementById('rp-play-btn').onclick = function () { self.togglePause(); };
            document.getElementById('rp-speed-btn').onclick = function () { self.cycleSpeed(); };
            document.getElementById('rp-exit-btn').onclick = function () { self.exit(); };
            document.getElementById('rp-progress').oninput = function (e) {
                if (self.data) self.seek(parseFloat(e.target.value) / 100 * self.data.duration);
            };
        }

        loadReplay(data) {
            if (!this.canvas) this.init();
            this.data = data;
            this.enemies.clear();
            this.towers.clear();
            this.eventIndex = 0;
            this.currentTime = 0;
            this.speed = 1;
            this.paused = false;
            this._cachedMap = null;
            document.getElementById('rp-speed-btn').textContent = '⏩ 1x';
            document.getElementById('rp-play-btn').textContent = '⏸ 暂停';
            document.getElementById('rp-progress').value = 0;

            var lvl = data.levelId || (data.isTrial ? '试炼模式' : '?');
            document.getElementById('rp-level-val').textContent =
                typeof lvl === 'number' && lvl > 0 ? '第' + lvl + '关' : (lvl || '未知');
            var totalW = data.totalWaves || (data.waves ? data.waves.length : '?');
            document.getElementById('rp-wave-val').textContent = '0/' + totalW;
            document.getElementById('rp-hp-val').textContent = data.startHp != null ? data.startHp : '?';
            document.getElementById('rp-total-val').textContent = this._fmt(data.duration || 0);
            document.getElementById('rp-time-val').textContent = '00:00';
        }

        play() {
            if (!this.data) return;
            this.running = true;
            this.paused = false;
            this._lastTs = performance.now();
            var self = this;
            function _loop(ts) {
                if (!self.running) return;
                if (!self.paused) {
                    var dt = (ts - self._lastTs) / 1000 * self.speed;
                    self._lastTs = ts;
                    self.update(dt);
                }
                self.render();
                self._rafId = requestAnimationFrame(_loop);
            }
            this._rafId = requestAnimationFrame(_loop);
        }

        togglePause() {
            this.paused = !this.paused;
            document.getElementById('rp-play-btn').textContent = this.paused ? '▶ 继续' : '⏸ 暂停';
            if (!this.paused) this._lastTs = performance.now();
        }

        cycleSpeed() {
            this.speed = this.speed === 1 ? 2 : (this.speed === 2 ? 4 : 1);
            document.getElementById('rp-speed-btn').textContent = '⏩ ' + this.speed + 'x';
        }

        seek(t) {
            this.enemies.clear();
            this.towers.clear();
            this.eventIndex = 0;
            this.currentTime = 0;
            this._processEventsUntil(t);
            this._updateEnemiesForTime(t);
            this.currentTime = t;
        }

        exit() {
            this.running = false;
            if (this._rafId) cancelAnimationFrame(this._rafId);
            if (this._onExitCallback) this._onExitCallback();
        }

        onExit(cb) { this._onExitCallback = cb; }

        update(dt) {
            var nextT = this.currentTime + dt;
            this._processEventsUntil(nextT);
            this._updateEnemiesForTime(nextT);

            this.currentTime = nextT;

            if (this.data && this.data.duration) {
                var pct = Math.min(100, (this.currentTime / this.data.duration) * 100);
                document.getElementById('rp-progress').value = pct;
                document.getElementById('rp-time-val').textContent = this._fmt(this.currentTime);
            }

            if (this.data && this.currentTime >= this.data.duration &&
                this.eventIndex >= (this.data.frames ? this.data.frames.length : 0)) {
                this.paused = true;
                document.getElementById('rp-play-btn').textContent = '▶ 已结束';
            }

            if (window.ParticleSystem && typeof window.ParticleSystem.update === 'function') {
                try { window.ParticleSystem.update(dt); } catch (e) {}
            }
        }

        _processEventsUntil(t) {
            if (!this.data || !this.data.frames) return;
            while (this.eventIndex < this.data.frames.length &&
                   this.data.frames[this.eventIndex].t <= t) {
                this._applyEvent(this.data.frames[this.eventIndex]);
                this.eventIndex++;
            }
        }

        _applyEvent(ev) {
            switch (ev.event) {
                case 'wave_start':
                    document.getElementById('rp-wave-val').textContent =
                        (ev.wave || 0) + '/' + (this.data.totalWaves || '?');
                    break;
                case 'wave_end':
                    break;
                case 'tower_place': {
                    var key = ev.gx + ',' + ev.gy;
                    if (!this.towers.has(key)) {
                        var x = ev.gx * TILE + TILE / 2;
                        var y = ev.gy * TILE + TILE / 2;
                        var sprite = null;
                        if (window.SpriteFactory) {
                            try { sprite = window.SpriteFactory.generateTowerSprite(ev.type, 1); } catch (e) {}
                        }
                        this.towers.set(key, {
                            type: ev.type, level: 0, x: x, y: y, sprite: sprite
                        });
                    }
                    break;
                }
                case 'tower_upgrade': {
                    var key2 = ev.gx + ',' + ev.gy;
                    var tw = this.towers.get(key2);
                    if (tw) {
                        tw.level = (ev.level || 1) - 1;
                        if (window.SpriteFactory) {
                            try { tw.sprite = window.SpriteFactory.generateTowerSprite(tw.type, ev.level); } catch (e) {}
                        }
                    }
                    break;
                }
                case 'tower_remove': {
                    var key3 = ev.gx + ',' + ev.gy;
                    this.towers.delete(key3);
                    break;
                }
                case 'skill_cast':
                    if (window.ParticleSystem) {
                        try {
                            if (ev.skill === 'rocket') {
                                window.ParticleSystem.spawnBurst(ev.x || 400, ev.y || 256, '#ff5722', 20);
                            } else if (ev.skill === 'freeze') {
                                window.ParticleSystem.spawn(WIDTH / 2, HEIGHT / 2, {
                                    count: 40, color: '#4fc3f7', speed: 80, life: 0.6, size: 3
                                });
                            }
                        } catch (e) {}
                    }
                    break;
            }
        }

        _updateEnemiesForTime(t) {
            if (!this.data || !this.data.enemies) return;
            var self = this;
            this.data.enemies.forEach(function (en) {
                if (en.spawnT != null && en.spawnT <= t && !self.enemies.has(en.id)) {
                    if (en.deathT == null || en.deathT > t) {
                        self._spawnEnemy(en);
                    }
                }
                if (en.deathT != null && en.deathT <= t && self.enemies.has(en.id)) {
                    var liveE = self.enemies.get(en.id);
                    if (liveE) {
                        if (window.ParticleSystem) {
                            try { window.ParticleSystem.spawnBurst(liveE.x, liveE.y, '#f44336', 8); } catch (e) {}
                        }
                    }
                    self.enemies.delete(en.id);
                }
            });

            this.enemies.forEach(function (e) {
                if (e.pathPts && e.pathPts.length > 1) {
                    var p0 = null, p1 = null;
                    for (var i = 0; i < e.pathPts.length - 1; i++) {
                        if (e.pathPts[i].t <= t && e.pathPts[i + 1].t >= t) {
                            p0 = e.pathPts[i]; p1 = e.pathPts[i + 1]; break;
                        }
                    }
                    if (p0 && p1) {
                        var localT = (t - p0.t) / Math.max(0.001, p1.t - p0.t);
                        e.x = p0.x + (p1.x - p0.x) * Math.min(1, localT);
                        e.y = p0.y + (p1.y - p0.y) * Math.min(1, localT);
                    } else if (e.pathPts.length > 0) {
                        var last = e.pathPts[e.pathPts.length - 1];
                        e.x = last.x; e.y = last.y;
                    }
                }
            });
        }

        _spawnEnemy(en) {
            var sprite = null;
            if (window.SpriteFactory) {
                try { sprite = window.SpriteFactory.generateEnemySprite(en.type); } catch (e) {}
            }
            var pathPts = en.path || [];
            var x = pathPts.length > 0 ? pathPts[0].x : 0;
            var y = pathPts.length > 0 ? pathPts[0].y : 0;
            this.enemies.set(en.id, {
                type: en.type, x: x, y: y, sprite: sprite, active: true,
                maxHp: 100, hp: 100, pathPts: pathPts
            });
        }

        render() {
            if (!this.ctx || !this.data) return;
            var ctx = this.ctx;
            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            var grid = this._getMapGrid();
            if (grid) this._renderMap(ctx, grid);

            this.towers.forEach(function (tw) {
                if (tw.sprite) {
                    ctx.drawImage(tw.sprite, tw.x - TILE / 2, tw.y - TILE / 2);
                } else {
                    ctx.fillStyle = '#888';
                    ctx.fillRect(tw.x - 12, tw.y - 12, 24, 24);
                }
            });

            this.enemies.forEach(function (e) {
                if (e.sprite) {
                    ctx.drawImage(e.sprite, e.x - e.sprite.width / 2, e.y - e.sprite.height / 2);
                } else {
                    ctx.fillStyle = '#4caf50';
                    ctx.fillRect(e.x - 6, e.y - 6, 12, 12);
                }
                ctx.fillStyle = '#400';
                ctx.fillRect(e.x - 12, e.y - 18, 24, 3);
                ctx.fillStyle = '#4caf50';
                ctx.fillRect(e.x - 12, e.y - 18, 24, 3);
            });

            if (window.ParticleSystem) {
                try { window.ParticleSystem.render(ctx); } catch (e) {}
            }
        }

        _renderMap(ctx, grid) {
            for (var y = 0; y < grid.length; y++) {
                for (var x = 0; x < grid[y].length; x++) {
                    var v = grid[y][x];
                    var sp = this.tileSprites[v] || this.tileSprites[0];
                    if (sp) ctx.drawImage(sp, x * TILE, y * TILE);
                }
            }
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            for (var cx = 0; cx <= 25; cx++) {
                ctx.beginPath(); ctx.moveTo(cx * TILE, 0); ctx.lineTo(cx * TILE, 16 * TILE); ctx.stroke();
            }
            for (var cy = 0; cy <= 16; cy++) {
                ctx.beginPath(); ctx.moveTo(0, cy * TILE); ctx.lineTo(25 * TILE, cy * TILE); ctx.stroke();
            }
        }

        _getMapGrid() {
            if (this._cachedMap) return this._cachedMap;
            if (typeof window.LEVEL_CONFIG !== 'undefined' && window.LEVEL_CONFIG.levels) {
                var lid = this.data.levelId;
                if (lid > 0 && window.LEVEL_CONFIG.levels[lid - 1]) {
                    this._cachedMap = window.LEVEL_CONFIG.levels[lid - 1].map;
                    return this._cachedMap;
                }
                if (window.LEVEL_CONFIG.levels[0]) {
                    this._cachedMap = window.LEVEL_CONFIG.levels[0].map;
                    return this._cachedMap;
                }
            }
            return null;
        }

        _fmt(s) {
            var m = Math.floor(s / 60), sec = Math.floor(s % 60);
            return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
        }
    }

    window.ReplayPlayer = new ReplayPlayer();
})();
