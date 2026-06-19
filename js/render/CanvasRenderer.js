"use strict";
(function () {
    var TILE = 32;
    var WIDTH = 25 * TILE;
    var HEIGHT = 16 * TILE;

    class CanvasRenderer {
        constructor() {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = null;
            this.width = WIDTH;
            this.height = HEIGHT;
            this.offsetX = 0;
            this.offsetY = 0;
            this._mouseX = 0;
            this._mouseY = 0;
            this._initialized = false;

            if (this.canvas) {
                this._initCanvas();
            }
        }

        _initCanvas() {
            if (this._initialized) return;
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = WIDTH * 2;
            this.canvas.height = HEIGHT * 2;
            this.ctx.scale(2, 2);
            this.ctx.imageSmoothingEnabled = false;
            this._initialized = true;

            var self = this;
            this.canvas.addEventListener('mousemove', function (e) {
                var rect = self.canvas.getBoundingClientRect();
                var scaleX = WIDTH / rect.width;
                var scaleY = HEIGHT / rect.height;
                self._mouseX = (e.clientX - rect.left) * scaleX;
                self._mouseY = (e.clientY - rect.top) * scaleY;
            });
        }

        resize(containerWidth, containerHeight) {
            if (!this.canvas) return;
            var aspect = WIDTH / HEIGHT;
            var containerAspect = containerWidth / containerHeight;
            var cssW, cssH;
            if (containerAspect > aspect) {
                cssH = containerHeight;
                cssW = cssH * aspect;
            } else {
                cssW = containerWidth;
                cssH = cssW / aspect;
            }
            this.canvas.style.width = cssW + 'px';
            this.canvas.style.height = cssH + 'px';
            this.canvas.style.marginLeft = ((containerWidth - cssW) / 2) + 'px';
            this.canvas.style.marginTop = ((containerHeight - cssH) / 2) + 'px';
        }

        render() {
            if (!this.canvas) return;
            if (!this._initialized) this._initCanvas();
            var ctx = this.ctx;

            ctx.save();

            var sx = 0, sy = 0;
            if (window.GameEngine && window.GameEngine.screen && window.GameEngine.screen.shakeT > 0) {
                var mag = window.GameEngine.screen.shakeMag || 0;
                sx = (Math.random() - 0.5) * mag * 2;
                sy = (Math.random() - 0.5) * mag * 2;
            }

            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            ctx.translate(sx, sy);

            if (window.GameMap && typeof window.GameMap.render === 'function') {
                window.GameMap.render(ctx);
            }

            if (window.GameEngine && window.GameEngine.selectedTowerType) {
                this.drawPlacementPreview(ctx);
            }

            if (window.TowerSystem && typeof window.TowerSystem.render === 'function') {
                window.TowerSystem.render(ctx);
            }

            if (window.EnemySystem && typeof window.EnemySystem.render === 'function') {
                window.EnemySystem.render(ctx);
            }

            if (window.TowerSystem && typeof window.TowerSystem.renderProjectiles === 'function') {
                window.TowerSystem.renderProjectiles(ctx);
            }

            if (window.SkillSystem && typeof window.SkillSystem.render === 'function') {
                window.SkillSystem.render(ctx);
            }

            if (window.GameEngine && window.GameEngine.selectedTower) {
                this.drawSelectedTowerRange(ctx);
            }

            if (window.ParticleSystem && typeof window.ParticleSystem.render === 'function') {
                window.ParticleSystem.render(ctx);
            }

            ctx.restore();
        }

        drawPlacementPreview(ctx) {
            var engine = window.GameEngine;
            if (!engine || !engine.selectedTowerType) return;

            var mx = this._mouseX;
            var my = this._mouseY;
            var grid = this.worldToGrid(mx, my);
            var gx = grid[0], gy = grid[1];

            if (gx < 0 || gy < 0 || gx >= 25 || gy >= 16) return;

            var worldPos = this.gridToWorld(gx, gy);
            var wx = worldPos[0], wy = worldPos[1];

            var isTowerSlot = false;
            if (window.GameMap && typeof window.GameMap.getTile === 'function') {
                var tile = window.GameMap.getTile(gx, gy);
                isTowerSlot = tile === 2;
            }

            var hasTower = false;
            if (window.TowerSystem && typeof window.TowerSystem.getTowerAt === 'function') {
                hasTower = !!window.TowerSystem.getTowerAt(gx, gy);
            }

            var valid = isTowerSlot && !hasTower;

            var range = 3;
            var towerCfg = window.TOWER_CONFIG ? window.TOWER_CONFIG[engine.selectedTowerType] : null;
            if (towerCfg && towerCfg.levels && towerCfg.levels[0]) {
                range = towerCfg.levels[0].range || 3;
            }
            var rangePx = range * TILE;

            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = valid ? '#4caf50' : '#f44336';
            ctx.fillRect(gx * TILE, gy * TILE, TILE, TILE);
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(wx, wy, rangePx, 0, Math.PI * 2);
            ctx.fillStyle = valid ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)';
            ctx.fill();
            ctx.strokeStyle = valid ? 'rgba(76,175,80,0.6)' : 'rgba(244,67,54,0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            if (valid && window.SpriteFactory && typeof window.SpriteFactory.generateTowerSprite === 'function') {
                var sprite = window.SpriteFactory.generateTowerSprite(engine.selectedTowerType, 1);
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.drawImage(sprite, Math.floor(wx - TILE / 2), Math.floor(wy - TILE / 2));
                ctx.restore();
            }
        }

        drawSelectedTowerRange(ctx) {
            var engine = window.GameEngine;
            if (!engine || !engine.selectedTower) return;

            var t = engine.selectedTower;
            var wx = t.x;
            var wy = t.y;
            var rangePx = (t.range || 3) * TILE;

            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.arc(wx, wy, rangePx, 0, Math.PI * 2);
            ctx.fillStyle = '#2196f3';
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(wx, wy, rangePx, 0, Math.PI * 2);
            ctx.strokeStyle = '#64b5f6';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.restore();

            if (t.gx != null && t.gy != null) {
                ctx.save();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = '#2196f3';
                ctx.fillRect(t.gx * TILE, t.gy * TILE, TILE, TILE);
                ctx.restore();
            }
        }

        worldToGrid(wx, wy) {
            return [Math.floor(wx / TILE), Math.floor(wy / TILE)];
        }

        gridToWorld(gx, gy) {
            return [gx * TILE + TILE / 2, gy * TILE + TILE / 2];
        }
    }

    window.CanvasRenderer = new CanvasRenderer();
    window.TILE = TILE;
})();
