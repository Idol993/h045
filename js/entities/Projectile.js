"use strict";
(function () {
    var TILE = 32;

    class Projectile {
        constructor() {
            this._active = false;
            this._pooled = false;
            this.reset();
        }

        reset(opts) {
            opts = opts || {};
            this._active = true;
            this.type = opts.type;
            this.x = opts.x;
            this.y = opts.y;
            this.target = opts.target;
            this.damage = opts.damage;
            this.speed = opts.speed;
            this.color = opts.color;
            this.splash = opts.splash || 0;
            this.burn = opts.burn || 0;
            this.slow = opts.slow || 0;
            this.slowDur = opts.slowDur || 0;
            this.pierce = opts.pierce || 0;
            this.hitSet = opts.hitSet || new Set();
            this.chain = opts.chain || 0;
            this.chainHit = opts.chainHit || new Set();
            this.tower = opts.tower;
            this.angle = opts.angle || 0;
            this.vx = 0;
            this.vy = 0;
            this.life = 2.0;
            return this;
        }

        update(dt) {
            if (!this._active) return;
            this.life -= dt;
            if (this.life <= 0) {
                this._active = false;
                return;
            }

            if (this.type === 'arrow') {
                if (this.vx === 0 && this.vy === 0) {
                    if (this.target && this.target._active) {
                        var dx0 = this.target.x - this.x;
                        var dy0 = this.target.y - this.y;
                        var d0 = Math.sqrt(dx0 * dx0 + dy0 * dy0) || 1;
                        this.angle = Math.atan2(dy0, dx0);
                        this.vx = dx0 / d0 * this.speed;
                        this.vy = dy0 / d0 * this.speed;
                    } else {
                        this.vx = Math.cos(this.angle) * this.speed;
                        this.vy = Math.sin(this.angle) * this.speed;
                    }
                }
                this.x += this.vx * dt;
                this.y += this.vy * dt;

                var enemies = window.EnemySystem.activeEnemies;
                for (var i = 0; i < enemies.length; i++) {
                    var e = enemies[i];
                    if (!e._active || this.hitSet.has(e.id)) continue;
                    var dx = e.x - this.x;
                    var dy = e.y - this.y;
                    var r = e.size + 4;
                    if (dx * dx + dy * dy <= r * r) {
                        e.takeDamage(this.damage);
                        this.hitSet.add(e.id);
                        window.ParticleSystem.spawnBurst(this.x, this.y, this.color, 4);
                        if (this.hitSet.size > this.pierce) {
                            this._active = false;
                            return;
                        }
                    }
                }
                if (this.x < 0 || this.x > 25 * TILE || this.y < 0 || this.y > 16 * TILE) {
                    this._active = false;
                }
            } else {
                if (!this.target || !this.target._active) {
                    this.life = Math.min(this.life, 0.3);
                    if (this.target) {
                        this.x += (this.target.x - this.x) * 0.05;
                        this.y += (this.target.y - this.y) * 0.05;
                    }
                    this._active = this.life > 0;
                    return;
                }
                var dxT = this.target.x - this.x;
                var dyT = this.target.y - this.y;
                var dT = Math.sqrt(dxT * dxT + dyT * dyT) || 1;
                var mv = this.speed * dt;
                if (mv >= dT) {
                    this.hit(this.target);
                    return;
                }
                this.x += dxT / dT * mv;
                this.y += dyT / dT * mv;
            }
        }

        hit(enemy) {
            this._active = false;
            window.ParticleSystem.spawnBurst(this.x, this.y, this.color, 8);

            if (this.splash > 0) {
                var r2 = this.splash * this.splash;
                var enemies = window.EnemySystem.activeEnemies;
                for (var i = 0; i < enemies.length; i++) {
                    var e = enemies[i];
                    if (!e._active) continue;
                    var dx = e.x - this.x;
                    var dy = e.y - this.y;
                    if (dx * dx + dy * dy <= r2) {
                        var falloff = 1 - Math.sqrt(dx * dx + dy * dy) / this.splash * 0.5;
                        e.takeDamage(this.damage * Math.max(0.3, falloff));
                        if (this.burn > 0) {
                            e.applyBurn(this.burn, 3);
                        }
                    }
                }
            } else if (this.type === 'magic') {
                enemy.takeDamage(this.damage);
                if (this.slow > 0) {
                    enemy.applySlow(this.slow, this.slowDur);
                }
                this.chainHit.add(enemy.id);
                if (this.chain > 0) {
                    var next = null;
                    var minD2 = (3 * TILE) * (3 * TILE);
                    var enemies2 = window.EnemySystem.activeEnemies;
                    for (var j = 0; j < enemies2.length; j++) {
                        var e2 = enemies2[j];
                        if (!e2._active || this.chainHit.has(e2.id)) continue;
                        var dx2 = e2.x - enemy.x;
                        var dy2 = e2.y - enemy.y;
                        var d2 = dx2 * dx2 + dy2 * dy2;
                        if (d2 < minD2) {
                            minD2 = d2;
                            next = e2;
                        }
                    }
                    if (next) {
                        window.TowerSystem.spawnProjectile({
                            type: 'magic',
                            x: enemy.x,
                            y: enemy.y,
                            target: next,
                            damage: this.damage * 0.7,
                            speed: this.speed,
                            slow: this.slow,
                            slowDur: this.slowDur,
                            chain: this.chain - 1,
                            chainHit: this.chainHit,
                            color: this.color,
                            tower: this.tower
                        });
                    }
                }
            } else {
                enemy.takeDamage(this.damage);
            }
        }

        render(ctx) {
            if (!this._active) return;
            ctx.save();
            ctx.fillStyle = this.color;
            if (this.type === 'arrow') {
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.fillRect(-8, -1, 16, 2);
                ctx.beginPath();
                ctx.moveTo(8, -3);
                ctx.lineTo(8, 3);
                ctx.lineTo(12, 0);
                ctx.closePath();
                ctx.fill();
            } else if (this.type === 'cannonball') {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(this.x - 4, this.y - 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                var t = performance.now() / 100;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                for (var i = 0; i < 4; i++) {
                    var a = t + i * Math.PI / 2;
                    ctx.fillRect(
                        this.x + Math.cos(a) * 6 - 1,
                        this.y + Math.sin(a) * 6 - 1,
                        2,
                        2
                    );
                }
            }
            ctx.restore();
        }
    }

    window.Projectile = Projectile;
})();
