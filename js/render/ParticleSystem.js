"use strict";
(function () {
    var MAX_PARTICLES = 500;

    class ParticleSystem {
        constructor() {
            this.particles = [];
            this._writeIdx = 0;
        }

        init() {
            this.particles = [];
            this._writeIdx = 0;
        }

        spawn(x, y, opts) {
            opts = opts || {};
            var count = opts.count || 10;
            var color = opts.color || '#ffffff';
            var speed = opts.speed != null ? opts.speed : 2;
            var life = opts.life != null ? opts.life : 0.5;
            var size = opts.size || 2;
            var gravity = opts.gravity != null ? opts.gravity : 0;
            var spread = opts.spread != null ? opts.spread : Math.PI * 2;
            var baseAngle = opts.baseAngle || 0;
            var type = opts.type || 'pixel';

            for (var i = 0; i < count; i++) {
                var angle = baseAngle - spread / 2 + Math.random() * spread;
                var sp = speed * (0.5 + Math.random() * 0.5);
                var p = {
                    type: type,
                    active: true,
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * sp,
                    vy: Math.sin(angle) * sp,
                    life: life * (0.7 + Math.random() * 0.6),
                    maxLife: life,
                    color: color,
                    size: size,
                    gravity: gravity,
                    text: opts.text || null
                };
                this._write(p);
            }
        }

        _write(p) {
            if (this.particles.length < MAX_PARTICLES) {
                this.particles.push(p);
            } else {
                this.particles[this._writeIdx] = p;
                this._writeIdx = (this._writeIdx + 1) % MAX_PARTICLES;
            }
        }

        update(dt) {
            var arr = this.particles;
            for (var i = 0; i < arr.length; i++) {
                var p = arr[i];
                if (!p || !p.active) continue;
                p.x += p.vx * dt * 60;
                p.y += p.vy * dt * 60;
                p.vy += p.gravity * dt * 60;
                p.life -= dt;
                if (p.life <= 0) {
                    p.active = false;
                }
            }
        }

        render(ctx) {
            var arr = this.particles;
            ctx.save();
            for (var i = 0; i < arr.length; i++) {
                var p = arr[i];
                if (!p || !p.active) continue;
                var alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
                ctx.globalAlpha = alpha;

                if (p.type === 'text' && p.text) {
                    ctx.fillStyle = p.color;
                    ctx.font = 'bold 12px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(p.text, p.x, p.y);
                } else {
                    ctx.fillStyle = p.color;
                    var s = Math.max(1, Math.floor(p.size));
                    ctx.fillRect(
                        Math.floor(p.x - s / 2),
                        Math.floor(p.y - s / 2),
                        s,
                        s
                    );
                }
            }
            ctx.restore();
        }

        spawnBurst(x, y, color, n) {
            n = n || 8;
            this.spawn(x, y, {
                count: n,
                color: color,
                speed: 3,
                life: 0.4,
                size: 3,
                gravity: 0.1,
                spread: Math.PI * 2
            });
        }

        spawnDamageText(x, y, text, color) {
            color = color || '#ffeb3b';
            this.spawn(x, y, {
                count: 1,
                color: color,
                speed: 1.5,
                life: 0.8,
                size: 1,
                gravity: -0.08,
                spread: 0.3,
                baseAngle: -Math.PI / 2,
                type: 'text',
                text: text
            });
        }
    }

    window.ParticleSystem = new ParticleSystem();
})();
