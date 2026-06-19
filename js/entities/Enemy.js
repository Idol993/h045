"use strict";
(function () {
    var TILE = 32;

    class Enemy {
        constructor() {
            this._active = false;
            this._pooled = false;
            this.reset();
        }

        reset(opts) {
            opts = opts || {};
            this._active = true;
            this.type = opts.type || 'normal';
            var cfg = window.ENEMY_CONFIG[this.type];
            var lvl = window.GameEngine.state.levelId || 1;
            var growth = 1 + 0.18 * Math.max(0, lvl - 1);
            this.maxHp = Math.floor(cfg.hp * growth);
            this.hp = this.maxHp;
            this.baseSpeed = cfg.speed * TILE;
            this.speed = this.baseSpeed;
            this.gold = cfg.gold;
            this.color = cfg.color;
            this.size = cfg.size;
            this.x = 0;
            this.y = 0;
            this.path = null;
            this.pathIdx = 0;
            this.pathProgress = 0;
            this.effects = { slow: 0, slowFactor: 1, burn: 0, burnDps: 0 };
            this.sprite = window.SpriteFactory.generateEnemySprite(this.type);
            this.hitFlash = 0;
            this.id = (Enemy._idCounter = (Enemy._idCounter || 0) + 1);
            return this;
        }

        update(dt) {
            if (!this._active) return;

            if (this.effects.slow > 0) {
                this.effects.slow -= dt;
                this.speed = this.baseSpeed * this.effects.slowFactor;
                if (this.effects.slow <= 0) {
                    this.speed = this.baseSpeed;
                    this.effects.slowFactor = 1;
                }
            }
            if (this.effects.burn > 0) {
                this.effects.burn -= dt;
                this.takeDamage(this.effects.burnDps * dt, false);
            }
            this.hitFlash = Math.max(0, this.hitFlash - dt * 5);

            if (!this.path || this.pathIdx >= this.path.length) {
                this.reachEnd();
                return;
            }
            var target = this.path[this.pathIdx];
            var dx = target.x - this.x;
            var dy = target.y - this.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var moveDist = this.speed * dt;
            if (moveDist >= dist) {
                this.x = target.x;
                this.y = target.y;
                this.pathIdx++;
                if (this.pathIdx >= this.path.length) {
                    this.reachEnd();
                    return;
                }
            } else {
                this.x += dx / dist * moveDist;
                this.y += dy / dist * moveDist;
            }
            this.pathProgress = this.path ? (this.pathIdx / this.path.length) : 0;
        }

        applySlow(factor, duration) {
            this.effects.slow = Math.max(this.effects.slow, duration);
            this.effects.slowFactor = Math.min(this.effects.slowFactor, 1 - factor);
            if (this.effects.slow <= 0) {
                this.effects.slowFactor = 1 - factor;
            }
        }

        applyBurn(dps, duration) {
            this.effects.burn = Math.max(this.effects.burn, duration);
            this.effects.burnDps = Math.max(this.effects.burnDps, dps);
        }

        takeDamage(dmg, showText) {
            this.hp -= dmg;
            this.hitFlash = 1;
            if (showText !== false) {
                window.ParticleSystem.spawnDamageText(this.x, this.y - 10, Math.round(dmg));
            }
            if (this.hp <= 0 && this._active) {
                this.die();
            }
        }

        die() {
            this._active = false;
            var bonus = window.SkillSystem && window.SkillSystem.healGoldBonus > 0
                ? window.SKILL_CONFIG.heal.goldBonus
                : 1;
            var goldDrop = Math.floor(this.gold * bonus);
            window.GameEngine.addGold(goldDrop);
            window.ParticleSystem.spawnDamageText(this.x, this.y - 20, '+' + goldDrop, '#ffd700');
            window.ParticleSystem.spawnBurst(this.x, this.y, this.color, 12);
            window.ReplayRecorder.safeRecord('recordEnemyDeath', this.id, window.GameEngine.elapsed);
            window.EnemySystem.onEnemyDeath(this);
        }

        reachEnd() {
            var dmg = this.type === 'boss' ? 5 : (this.type === 'tank' ? 2 : 1);
            window.GameEngine.takeDamage(dmg);
            this._active = false;
            window.ParticleSystem.spawnBurst(this.x, this.y, '#f44336', 6);
            window.ReplayRecorder.safeRecord('recordEnemyDeath', this.id, window.GameEngine.elapsed, 'reach_end');
            window.EnemySystem.onEnemyDeath(this);
        }

        render(ctx) {
            if (!this._active) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.effects.slow > 0) {
                ctx.filter = 'hue-rotate(180deg) brightness(1.3)';
            }
            ctx.globalAlpha = 0.7 + 0.3 * this.hitFlash;
            var s = this.sprite;
            ctx.drawImage(s, -s.width / 2, -s.height / 2);
            ctx.restore();

            var bw = this.size * 2;
            var bx = this.x - bw / 2;
            var by = this.y - this.size - 6;
            ctx.fillStyle = '#400';
            ctx.fillRect(bx, by, bw, 3);
            var hpRatio = this.hp / this.maxHp;
            ctx.fillStyle = hpRatio > 0.5 ? '#4caf50' : (hpRatio > 0.25 ? '#ff9800' : '#f44336');
            ctx.fillRect(bx, by, bw * Math.max(0, hpRatio), 3);

            if (this.effects.burn > 0) {
                ctx.fillStyle = '#ff5722';
                ctx.fillRect(this.x - 8, this.y - this.size - 10, 2, 2);
            }
            if (this.effects.slow > 0) {
                ctx.fillStyle = '#4fc3f7';
                ctx.fillRect(this.x - 5, this.y - this.size - 10, 2, 2);
            }
        }
    }

    window.Enemy = Enemy;
})();
