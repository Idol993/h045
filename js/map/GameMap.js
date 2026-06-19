"use strict";
(function () {
    var TILE = (window.LEVEL_CONFIG && window.LEVEL_CONFIG.TILE) || 32;

    function GameMap() {
        this.cols = 25;
        this.rows = 16;
        this.tile = TILE;
        this.grid = null;
        this.originalGrid = null;
        this.start = null;
        this.end = null;
        this.pathCache = new Map();
        this.tileSprites = {};
    }

    GameMap.prototype.init = function (grid) {
        var r, c, v;
        this.grid = [];
        this.originalGrid = [];
        for (r = 0; r < grid.length; r++) {
            this.grid[r] = grid[r].slice();
            this.originalGrid[r] = grid[r].slice();
        }
        for (r = 0; r < this.rows; r++) {
            for (c = 0; c < this.cols; c++) {
                v = this.grid[r][c];
                if (v === 3) {
                    this.start = { x: c, y: r };
                    this.grid[r][c] = 0;
                }
                if (v === 4) {
                    this.end = { x: c, y: r };
                    this.grid[r][c] = 0;
                }
            }
        }
        this.pathCache.clear();
        for (var i = 0; i <= 4; i++) {
            if (window.SpriteFactory && typeof window.SpriteFactory.generateTileSprite === 'function') {
                this.tileSprites[i] = window.SpriteFactory.generateTileSprite(i);
            }
        }
    };

    GameMap.prototype.getCell = function (gx, gy) {
        if (!this.inBounds(gx, gy)) {
            return 1;
        }
        return this.grid[gy][gx];
    };

    GameMap.prototype.setCell = function (gx, gy, val) {
        if (this.inBounds(gx, gy)) {
            this.grid[gy][gx] = val;
            this.originalGrid[gy][gx] = val;
            this.pathCache.clear();
        }
    };

    GameMap.prototype.isWalkable = function (gx, gy) {
        if (!this.inBounds(gx, gy)) {
            return false;
        }
        var val = this.grid[gy][gx];
        return val === 0 || val === 3 || val === 4;
    };

    GameMap.prototype.isPlaceable = function (gx, gy) {
        if (!this.inBounds(gx, gy)) {
            return false;
        }
        if (this.grid[gy][gx] !== 2) {
            return false;
        }
        if (window.TowerManager && typeof window.TowerManager.getTowerAt === 'function') {
            return window.TowerManager.getTowerAt(gx, gy) === null;
        }
        return true;
    };

    GameMap.prototype.clearPathCache = function () {
        this.pathCache.clear();
    };

    GameMap.prototype.inBounds = function (gx, gy) {
        return gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows;
    };

    GameMap.prototype.render = function (ctx) {
        var gy, gx, v, sprite;
        for (gy = 0; gy < this.rows; gy++) {
            for (gx = 0; gx < this.cols; gx++) {
                v = this.originalGrid[gy][gx];
                sprite = this.tileSprites[v];
                if (sprite) {
                    ctx.drawImage(sprite, gx * this.tile, gy * this.tile);
                }
            }
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (gx = 0; gx <= this.cols; gx++) {
            ctx.beginPath();
            ctx.moveTo(gx * this.tile, 0);
            ctx.lineTo(gx * this.tile, this.rows * this.tile);
            ctx.stroke();
        }
        for (gy = 0; gy <= this.rows; gy++) {
            ctx.beginPath();
            ctx.moveTo(0, gy * this.tile);
            ctx.lineTo(this.cols * this.tile, gy * this.tile);
            ctx.stroke();
        }
    };

    GameMap.prototype.renderPath = function (ctx, path) {
        if (!path || path.length < 2) {
            return;
        }
        ctx.strokeStyle = 'rgba(255,255,0,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path[0].x * this.tile + this.tile / 2, path[0].y * this.tile + this.tile / 2);
        for (var i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x * this.tile + this.tile / 2, path[i].y * this.tile + this.tile / 2);
        }
        ctx.stroke();
    };

    window.GameMap = new GameMap();
})();
