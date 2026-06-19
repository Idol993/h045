"use strict";
(function () {
    var TILE = 32;

    function easeOutBack(t) {
        if (t < 0.5) {
            var s = 1.70158 * 1.525;
            t = t * 2;
            return t * t * ((s + 1) * t + s) / 2 + 0.5;
        } else {
            var s = 1.70158 * 1.525;
            t = t * 2 - 2;
            return t * t * ((s + 1) * t + s) / 2 + 1;
        }
    }

    class Tower {
        constructor(gx, gy, type) {
            this.gx = gx;
            this.gy = gy;
            this.x = gx * TILE + TILE / 2;
            this.y = gy * TILE + TILE / 2;
            this.type = type;
            this.level = 0;
            this.cooldown = 0;
            this.target = null;
            this.totalCost = window.TOWER_CONFIG[type].levels[0].cost;
            this.sprite = window.SpriteFactory.generateTowerSprite(type, 1);
            this.angle = 0;
            this.placedT = 0;
        }

        get stats() {
            return window.TOWER_CONFIG[this.type].levels[this.level];
        }

        get rangePx() {
            return this.stats.range * TILE;
        }

        get nextLevelCost() {
            if (this.level >= 2) return null;
            return window.TOWER_CONFIG[this.type].levels[this.level + 1].cost;
        }

        upgrade() {
            if (this.level >= 2) return false;
            var cost = this.nextLevelCost;
            if (window.GameEngine.state.gold < cost) return false;
            window.GameEngine.state.gold -= cost;
            this.level++;
            this.totalCost += cost;
            this.sprite = window.SpriteFactory.generateTowerSprite(this.type, this.level + 1);
            window.EventBus.emit('gold-change', window.GameEngine.state.gold);
            window.ReplayRecorder.safeRecord('recordEvent', 'tower_upgrade', { gx: this.gx, gy: this.gy, level: this.level + 1 });
            return true;
        }

        sellValue() {
            return Math.floor(this.totalCost * 0.7);
        }

        findTarget() {
            var best = null;
            var bestScore = -Infinity;
            var r2 = this.rangePx * this.rangePx;
            var enemies = window.EnemySystem.activeEnemies;
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                if (!e._active) continue;
                var dx = e.x - this.x;
                var dy = e.y - this.y;
                if (dx * dx + dy * dy <= r2) {
                    if (e.pathProgress > bestScore) {
                        bestScore = e.pathProgress;
                        best = e;
                    }
                }
            }
            this.target = best;
            return best;
        }

        update(dt) {
            this.placedT += dt;
            this.cooldown -= dt;
            if (!this.target || !this.target._active || this._targetOutOfRange()) {
                this.findTarget();
            }
            if (this.target) {
                this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                if (this.cooldown <= 0) {
                    this.fire();
                    this.cooldown = 1 / this.stats.attackSpeed;
                }
            }
        }

        _targetOutOfRange() {
            var dx = this.target.x - this.x;
            var dy = this.target.y - this.y;
            return dx * dx + dy * dy > this.rangePx * this.rangePx;
        }

        fire() {
            var s = this.stats;
            if (this.type === 'cannon') {
                window.TowerSystem.spawnProjectile({
                    type: 'cannonball',
                    x: this.x,
                    y: this.y,
                    target: this.target,
                    damage: s.damage,
                    speed: 400,
                    splash: s.splash * TILE,
                    burn: s.burn,
                    color: '#ff7043',
                    tower: this
                });
            } else if (this.type === 'magic') {
                window.TowerSystem.spawnProjectile({
                    type: 'magic',
                    x: this.x,
                    y: this.y,
                    target: this.target,
                    damage: s.damage,
                    speed: 500,
                    slow: s.slow,
                    slowDur: s.slowDur,
                    chain: s.chain,
                    chainHit: new Set(),
                    color: '#ce93d8',
                    tower: this
                });
            } else {
                window.TowerSystem.spawnProjectile({
                    type: 'arrow',
                    x: this.x,
                    y: this.y,
                    target: this.target,
                    damage: s.damage,
                    speed: 600,
                    pierce: s.pierce,
                    hitSet: new Set(),
                    color: '#81c784',
                    angle: this.angle,
                    tower: this
                });
            }
        }

        render(ctx) {
            var t = Math.min(1, this.placedT / 0.3);
            var s = easeOutBack(t);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(s, s);
            ctx.drawImage(this.sprite, -TILE / 2, -TILE / 2);
            if (this.target && this.type !== 'magic') {
                ctx.save();
                ctx.rotate(this.angle);
                ctx.fillStyle = '#333';
                if (this.type === 'arrow') {
                    ctx.fillRect(0, -2, 16, 4);
                }
                if (this.type === 'cannon') {
                    ctx.fillRect(0, -4, 18, 8);
                }
                ctx.restore();
            }
            ctx.restore();
            if (this.level >= 1) {
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(this.x + 8, this.y - 14, 3, 3);
            }
            if (this.level >= 2) {
                ctx.fillRect(this.x + 12, this.y - 14, 3, 3);
            }
        }
    }

    window.Tower = Tower;
})();
