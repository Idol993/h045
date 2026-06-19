"use strict";
(function () {
    var TILE = 32;

    class Skill {
        constructor(type) {
            this.type = type;
            this.cd = 0;
            this.config = window.SKILL_CONFIG[type];
            this.effectT = 0;
            this.castingFlash = 0;
        }

        get isReady() {
            return this.cd <= 0;
        }

        get cdProgress() {
            if (this.config.cd <= 0) return 0;
            return Math.max(0, Math.min(1, this.cd / this.config.cd));
        }

        tryCast(mouseX, mouseY) {
            if (this.cd > 0) return false;
            this.cd = this.config.cd;
            this.castingFlash = 0.5;
            this.applyEffect(mouseX, mouseY);
            window.ReplayRecorder.safeRecord('recordEvent', 'skill_cast', { skill: this.type, x: mouseX, y: mouseY });
            window.EventBus.emit('skill-cast', this.type);
            return true;
        }

        applyEffect(mx, my) {
            var c = this.config;
            if (this.type === 'freeze') {
                var enemies = window.EnemySystem.activeEnemies;
                for (var i = 0; i < enemies.length; i++) {
                    var e = enemies[i];
                    if (e._active) {
                        e.applySlow(c.slow, c.duration);
                    }
                }
                this.effectT = c.duration;
                window.GameEngine.screenShake(0.3, 3);
                window.ParticleSystem.spawn(400, 256, {
                    count: 100,
                    color: '#4fc3f7',
                    speed: 180,
                    life: 0.8,
                    size: 3,
                    spread: Math.PI * 2
                });
            } else if (this.type === 'rocket') {
                var r2 = c.radius * c.radius;
                var enemies2 = window.EnemySystem.activeEnemies;
                for (var j = 0; j < enemies2.length; j++) {
                    var e2 = enemies2[j];
                    if (!e2._active) continue;
                    var dx = e2.x - mx;
                    var dy = e2.y - my;
                    if (dx * dx + dy * dy <= r2) {
                        var falloff = 1 - Math.sqrt(dx * dx + dy * dy) / c.radius * 0.5;
                        e2.takeDamage(c.damage * Math.max(0.3, falloff));
                    }
                }
                window.ParticleSystem.spawnBurst(mx, my, '#ff5722', 40);
                window.GameEngine.screenShake(0.5, 8);
            } else {
                window.GameEngine.state.hp = Math.min(
                    window.GameEngine.state.maxHp,
                    window.GameEngine.state.hp + c.hp
                );
                window.EventBus.emit('hp-change', window.GameEngine.state.hp);
                if (window.SkillSystem) {
                    window.SkillSystem.healGoldBonus = c.cd;
                }
                window.ParticleSystem.spawn(window.GameEngine.state.hp, 0, {
                    count: 30,
                    color: '#81c784',
                    speed: 60,
                    life: 1.2,
                    size: 3,
                    gravity: -30
                });
                window.GameEngine.screenShake(0.2, 2);
            }
        }

        update(dt) {
            this.cd = Math.max(0, this.cd - dt);
            this.effectT = Math.max(0, this.effectT - dt);
            this.castingFlash = Math.max(0, this.castingFlash - dt * 2);
        }

        renderOverlay(ctx) {
            if (this.type === 'freeze' && this.effectT > 0) {
                var duration = window.SKILL_CONFIG.freeze.duration;
                var alpha = 0.15 * (this.effectT / duration);
                ctx.fillStyle = 'rgba(79, 195, 247, ' + alpha + ')';
                ctx.fillRect(0, 0, 25 * TILE, 16 * TILE);
                var t = performance.now() / 200;
                for (var i = 0; i < 20; i++) {
                    var x = (i * 47 + t * 20) % (25 * TILE);
                    var y = (i * 83 + t * 30) % (16 * TILE);
                    ctx.fillStyle = '#b3e5fc';
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        }
    }

    window.Skill = Skill;
})();
