"use strict";
(function () {
    function createCanvas(w, h) {
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas: c, ctx: ctx };
    }

    function hexToRgb(hex) {
        var h = hex.replace('#', '');
        if (h.length === 3) {
            h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        }
        var n = parseInt(h, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function shade(hex, pct) {
        var c = hexToRgb(hex);
        var r = Math.max(0, Math.min(255, Math.round(c.r + (pct > 0 ? (255 - c.r) : c.r) * pct)));
        var g = Math.max(0, Math.min(255, Math.round(c.g + (pct > 0 ? (255 - c.g) : c.g) * pct)));
        var b = Math.max(0, Math.min(255, Math.round(c.b + (pct > 0 ? (255 - c.b) : c.b) * pct)));
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    class SpriteFactory {
        constructor() {
            this.cache = {};
        }

        getOrCreate(key, generator) {
            if (this.cache[key]) return this.cache[key];
            var c = generator();
            this.cache[key] = c;
            return c;
        }

        generateTowerSprite(type, level) {
            var self = this;
            var key = 'tower_' + type + '_' + level;
            return this.getOrCreate(key, function () {
                return self._buildTowerSprite(type, level);
            });
        }

        _buildTowerSprite(type, level) {
            var _a = createCanvas(32, 32), canvas = _a.canvas, ctx = _a.ctx;
            var config = window.TOWER_CONFIG ? window.TOWER_CONFIG[type] : null;
            var baseColor = config ? config.color : '#888888';
            level = level || 1;

            var light = shade(baseColor, 0.35);
            var dark = shade(baseColor, -0.4);
            var shadow = shade(baseColor, -0.6);

            ctx.fillStyle = shadow;
            ctx.fillRect(6, 26, 20, 4);

            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(6, 22, 20, 4);
            ctx.fillStyle = shade('#6d4c41', 0.3);
            ctx.fillRect(6, 22, 20, 1);
            ctx.fillStyle = shade('#6d4c41', -0.3);
            ctx.fillRect(6, 25, 20, 1);

            ctx.fillStyle = baseColor;
            ctx.fillRect(10, 12, 12, 12);
            ctx.fillStyle = light;
            ctx.fillRect(10, 12, 12, 2);
            ctx.fillRect(10, 12, 2, 12);
            ctx.fillStyle = dark;
            ctx.fillRect(10, 22, 12, 2);
            ctx.fillRect(20, 12, 2, 12);

            if (type === 'arrow') {
                ctx.fillStyle = dark;
                ctx.fillRect(14, 4, 4, 10);
                ctx.fillStyle = baseColor;
                ctx.fillRect(15, 5, 2, 8);
                ctx.fillStyle = light;
                ctx.fillRect(15, 5, 2, 2);

                ctx.fillStyle = '#8d6e63';
                ctx.fillRect(10, 8, 3, 2);
                ctx.fillRect(19, 8, 3, 2);

                ctx.fillStyle = light;
                ctx.fillRect(15, 2, 2, 3);
                ctx.fillRect(14, 3, 1, 1);
                ctx.fillRect(17, 3, 1, 1);
                ctx.fillRect(13, 4, 1, 1);
                ctx.fillRect(18, 4, 1, 1);

            } else if (type === 'cannon') {
                ctx.fillStyle = '#424242';
                ctx.fillRect(14, 2, 4, 10);
                ctx.fillStyle = '#616161';
                ctx.fillRect(15, 3, 2, 8);
                ctx.fillStyle = '#212121';
                ctx.fillRect(14, 2, 4, 2);
                ctx.fillStyle = '#ffab40';
                ctx.fillRect(15, 3, 2, 1);

                ctx.fillStyle = shade(baseColor, 0.2);
                ctx.fillRect(8, 8, 16, 4);
                ctx.fillStyle = dark;
                ctx.fillRect(8, 11, 16, 1);

                ctx.fillStyle = '#424242';
                ctx.fillRect(9, 9, 2, 2);
                ctx.fillRect(21, 9, 2, 2);

            } else if (type === 'magic') {
                ctx.fillStyle = shade(baseColor, 0.3);
                ctx.fillRect(15, 10, 2, 2);

                ctx.fillStyle = dark;
                ctx.fillRect(13, 4, 6, 6);
                ctx.fillStyle = shade(baseColor, 0.5);
                ctx.fillRect(14, 5, 4, 4);
                ctx.fillStyle = shade(baseColor, 0.8);
                ctx.fillRect(15, 6, 2, 2);
                ctx.fillStyle = light;
                ctx.fillRect(14, 5, 1, 1);

                ctx.fillStyle = light;
                ctx.fillRect(12, 8, 1, 1);
                ctx.fillRect(19, 8, 1, 1);
                ctx.fillRect(14, 3, 1, 1);
                ctx.fillRect(17, 3, 1, 1);

                ctx.fillStyle = shade(baseColor, 0.2);
                ctx.fillRect(13, 9, 2, 1);
                ctx.fillRect(17, 9, 2, 1);
            }

            if (level >= 2) {
                ctx.fillStyle = '#ffd54f';
                ctx.fillRect(10, 13, 1, 1);
                ctx.fillRect(21, 13, 1, 1);
                ctx.fillStyle = '#ffb300';
                ctx.fillRect(10, 21, 1, 1);
                ctx.fillRect(21, 21, 1, 1);
            }

            if (level >= 3) {
                ctx.fillStyle = '#ffeb3b';
                ctx.fillRect(15, 16, 2, 2);
                ctx.fillStyle = '#ffd54f';
                ctx.fillRect(14, 15, 1, 1);
                ctx.fillRect(17, 15, 1, 1);
                ctx.fillRect(14, 18, 1, 1);
                ctx.fillRect(17, 18, 1, 1);

                ctx.fillStyle = '#ffd54f';
                ctx.fillRect(8, 23, 2, 2);
                ctx.fillRect(22, 23, 2, 2);
            }

            return canvas;
        }

        generateEnemySprite(type) {
            var self = this;
            var key = 'enemy_' + type;
            return this.getOrCreate(key, function () {
                return self._buildEnemySprite(type);
            });
        }

        _buildEnemySprite(type) {
            var cfg = window.ENEMY_CONFIG ? window.ENEMY_CONFIG[type] : { color: '#888', size: 12 };
            var size = cfg.size;
            var color = cfg.color;
            var isBoss = type === 'boss';

            var canvasSize = isBoss ? 40 : 32;
            var _a = createCanvas(canvasSize, canvasSize), canvas = _a.canvas, ctx = _a.ctx;

            var cx = canvasSize / 2;
            var cy = canvasSize / 2;
            var half = Math.floor(size / 2);

            var light = shade(color, 0.35);
            var midLight = shade(color, 0.15);
            var dark = shade(color, -0.35);
            var darker = shade(color, -0.55);

            var bodyX = Math.floor(cx - half);
            var bodyY = Math.floor(cy - half + 2);
            var bodyW = size;
            var bodyH = size;

            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(bodyX, bodyY + bodyH, bodyW, 2);

            ctx.fillStyle = darker;
            ctx.fillRect(bodyX - 1, bodyY + bodyH - 1, bodyW + 2, 2);

            ctx.fillStyle = color;
            ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

            ctx.fillStyle = light;
            ctx.fillRect(bodyX, bodyY, bodyW, 2);
            ctx.fillRect(bodyX, bodyY, 2, bodyH);
            ctx.fillRect(bodyX + 1, bodyY + 1, 1, 1);

            ctx.fillStyle = midLight;
            ctx.fillRect(bodyX + 2, bodyY + 2, 2, 2);

            ctx.fillStyle = dark;
            ctx.fillRect(bodyX, bodyY + bodyH - 2, bodyW, 2);
            ctx.fillRect(bodyX + bodyW - 2, bodyY, 2, bodyH);

            var eyeY = bodyY + Math.floor(bodyH * 0.35);
            var eyeSize = isBoss ? 3 : 2;
            var eyeSpacing = isBoss ? 8 : 5;
            var eyeX1 = Math.floor(cx - eyeSpacing - eyeSize / 2);
            var eyeX2 = Math.floor(cx + eyeSpacing / 2);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(eyeX1, eyeY, eyeSize, eyeSize);
            ctx.fillRect(eyeX2, eyeY, eyeSize, eyeSize);

            ctx.fillStyle = '#000000';
            ctx.fillRect(eyeX1 + Math.floor(eyeSize / 2), eyeY, Math.ceil(eyeSize / 2), eyeSize);
            ctx.fillRect(eyeX2 + Math.floor(eyeSize / 2), eyeY, Math.ceil(eyeSize / 2), eyeSize);

            if (isBoss) {
                ctx.fillStyle = '#8d6e63';
                ctx.fillRect(bodyX + 2, bodyY - 4, 3, 4);
                ctx.fillRect(bodyX + bodyW - 5, bodyY - 4, 3, 4);
                ctx.fillStyle = '#bcaaa4';
                ctx.fillRect(bodyX + 2, bodyY - 4, 3, 1);
                ctx.fillRect(bodyX + bodyW - 5, bodyY - 4, 3, 1);

                ctx.fillStyle = '#ffd54f';
                ctx.fillRect(bodyX + 4, bodyY - 2, bodyW - 8, 2);
                ctx.fillRect(bodyX + 6, bodyY - 5, 2, 3);
                ctx.fillRect(bodyX + bodyW / 2 - 1, bodyY - 6, 2, 4);
                ctx.fillRect(bodyX + bodyW - 8, bodyY - 5, 2, 3);
                ctx.fillStyle = '#ffeb3b';
                ctx.fillRect(bodyX + 6, bodyY - 5, 1, 1);
                ctx.fillRect(bodyX + bodyW / 2 - 1, bodyY - 6, 1, 1);
                ctx.fillRect(bodyX + bodyW - 8, bodyY - 5, 1, 1);
            }

            if (type === 'fast') {
                ctx.fillStyle = light;
                ctx.fillRect(bodyX - 3, bodyY + 4, 2, 1);
                ctx.fillRect(bodyX - 4, bodyY + 7, 3, 1);
                ctx.fillRect(bodyX - 3, bodyY + 10, 2, 1);
            }

            if (type === 'tank') {
                ctx.fillStyle = '#455a64';
                ctx.fillRect(bodyX + 2, bodyY + 2, bodyW - 4, 3);
                ctx.fillRect(bodyX + 2, bodyY + bodyH - 5, bodyW - 4, 3);
                ctx.fillStyle = '#607d8b';
                ctx.fillRect(bodyX + 3, bodyY + 3, bodyW - 6, 1);
            }

            if (type === 'elite') {
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.fillRect(bodyX + 1, bodyY - 2, bodyW - 2, 1);
                ctx.fillRect(bodyX - 1, bodyY + 1, 1, bodyH - 2);
                ctx.fillRect(bodyX + bodyW, bodyY + 1, 1, bodyH - 2);
            }

            return canvas;
        }

        generateTileSprite(tileType) {
            var self = this;
            var key = 'tile_' + tileType;
            return this.getOrCreate(key, function () {
                return self._buildTileSprite(tileType);
            });
        }

        _buildTileSprite(tileType) {
            var _a = createCanvas(32, 32), canvas = _a.canvas, ctx = _a.ctx;

            if (tileType === 0) {
                ctx.fillStyle = '#a1887f';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#8d6e63';
                for (var i = 0; i < 8; i++) {
                    var x = (i * 7 + 3) % 30;
                    var y = (i * 11 + 5) % 30;
                    ctx.fillRect(x, y, 2, 2);
                }
                ctx.fillStyle = '#bcaaa4';
                for (var j = 0; j < 6; j++) {
                    var x2 = (j * 13 + 2) % 29;
                    var y2 = (j * 7 + 1) % 29;
                    ctx.fillRect(x2, y2, 1, 1);
                }
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                ctx.fillRect(0, 30, 32, 2);

            } else if (tileType === 1) {
                ctx.fillStyle = '#546e7a';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#37474f';
                ctx.fillRect(0, 28, 32, 4);
                ctx.fillRect(28, 0, 4, 32);
                ctx.fillStyle = '#78909c';
                ctx.fillRect(0, 0, 32, 3);
                ctx.fillRect(0, 0, 3, 32);
                ctx.fillStyle = '#607d8b';
                ctx.fillRect(4, 4, 10, 8);
                ctx.fillRect(18, 6, 10, 10);
                ctx.fillRect(6, 18, 12, 8);
                ctx.fillRect(22, 20, 6, 6);
                ctx.fillStyle = '#90a4ae';
                ctx.fillRect(5, 5, 3, 2);
                ctx.fillRect(19, 7, 3, 2);
                ctx.fillRect(7, 19, 3, 2);

            } else if (tileType === 2) {
                ctx.fillStyle = '#78909c';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#546e7a';
                ctx.fillRect(0, 28, 32, 4);
                ctx.fillRect(28, 0, 4, 32);
                ctx.fillStyle = '#b0bec5';
                ctx.fillRect(0, 0, 32, 3);
                ctx.fillRect(0, 0, 3, 32);
                ctx.fillStyle = '#90a4ae';
                ctx.fillRect(4, 4, 24, 24);
                ctx.fillStyle = '#607d8b';
                ctx.fillRect(4, 26, 24, 2);
                ctx.fillRect(26, 4, 2, 24);
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(6, 6, 20, 2);

            } else if (tileType === 3) {
                ctx.fillStyle = '#1b5e20';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#2e7d32';
                ctx.fillRect(4, 4, 24, 24);
                ctx.fillStyle = '#43a047';
                ctx.fillRect(8, 8, 16, 16);
                ctx.fillStyle = '#66bb6a';
                ctx.fillRect(10, 10, 12, 12);
                ctx.fillStyle = '#81c784';
                ctx.fillRect(12, 12, 8, 8);
                ctx.fillStyle = '#a5d6a7';
                ctx.fillRect(14, 14, 4, 4);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(15, 15, 2, 2);

            } else if (tileType === 4) {
                ctx.fillStyle = '#b71c1c';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#c62828';
                ctx.fillRect(4, 4, 24, 24);
                ctx.fillStyle = '#d32f2f';
                ctx.fillRect(8, 8, 16, 16);
                ctx.fillStyle = '#e53935';
                ctx.fillRect(10, 10, 12, 12);
                ctx.fillStyle = '#ef5350';
                ctx.fillRect(12, 12, 8, 8);
                ctx.fillStyle = '#f44336';
                ctx.fillRect(14, 14, 4, 4);
                ctx.fillStyle = '#ffcdd2';
                ctx.fillRect(15, 15, 2, 2);

            } else {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, 32, 32);
            }

            return canvas;
        }

        generateSkillIcon(type) {
            var self = this;
            var key = 'skill_' + type;
            return this.getOrCreate(key, function () {
                return self._buildSkillIcon(type);
            });
        }

        _buildSkillIcon(type) {
            var _a = createCanvas(64, 64), canvas = _a.canvas, ctx = _a.ctx;

            ctx.fillStyle = '#1a237e';
            ctx.fillRect(0, 0, 64, 64);

            var grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
            grad.addColorStop(0, 'rgba(255,255,255,0.35)');
            grad.addColorStop(0.6, 'rgba(100,140,255,0.15)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 64, 64);

            ctx.strokeStyle = '#5c6bc0';
            ctx.lineWidth = 3;
            ctx.strokeRect(4, 4, 56, 56);
            ctx.strokeStyle = '#7986cb';
            ctx.lineWidth = 1;
            ctx.strokeRect(6, 6, 52, 52);

            if (type === 'Q' || type === 0) {
                ctx.fillStyle = '#fff59d';
                for (var s = 0; s < 8; s++) {
                    var angle = (s / 8) * Math.PI * 2;
                    var sx = 32 + Math.cos(angle) * 22;
                    var sy = 32 + Math.sin(angle) * 22;
                    ctx.fillRect(Math.floor(sx) - 1, Math.floor(sy) - 1, 2, 2);
                }

                ctx.fillStyle = '#fdd835';
                ctx.fillRect(22, 12, 4, 24);
                ctx.fillRect(18, 16, 4, 16);
                ctx.fillRect(26, 16, 4, 16);

                ctx.fillStyle = '#ffc107';
                ctx.fillRect(30, 16, 4, 28);
                ctx.fillRect(34, 20, 4, 20);
                ctx.fillRect(38, 24, 4, 12);

                ctx.fillStyle = '#ffeb3b';
                ctx.fillRect(22, 12, 2, 6);
                ctx.fillRect(30, 16, 2, 4);
                ctx.fillStyle = '#fff9c4';
                ctx.fillRect(22, 12, 1, 2);

            } else if (type === 'E' || type === 1) {
                ctx.fillStyle = '#ff8a65';
                for (var p = 0; p < 6; p++) {
                    var px = 16 + (p % 3) * 16;
                    var py = 44 + Math.floor(p / 3) * 4;
                    ctx.fillRect(px, py, 6, 4);
                }

                ctx.fillStyle = '#424242';
                ctx.fillRect(18, 30, 28, 16);
                ctx.fillStyle = '#616161';
                ctx.fillRect(18, 30, 28, 2);
                ctx.fillStyle = '#212121';
                ctx.fillRect(18, 44, 28, 2);

                ctx.fillStyle = '#5d4037';
                ctx.fillRect(22, 34, 20, 10);
                ctx.fillStyle = '#795548';
                ctx.fillRect(22, 34, 20, 2);
                ctx.fillStyle = '#3e2723';
                ctx.fillRect(22, 42, 20, 2);

                ctx.fillStyle = '#d84315';
                ctx.beginPath();
                ctx.arc(32, 24, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#e64a19';
                ctx.beginPath();
                ctx.arc(32, 24, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ff7043';
                ctx.beginPath();
                ctx.arc(32, 24, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffab91';
                ctx.fillRect(30, 22, 2, 2);

                ctx.fillStyle = '#ff5722';
                ctx.fillRect(28, 14, 2, 6);
                ctx.fillRect(34, 16, 2, 4);
                ctx.fillRect(24, 18, 2, 4);
                ctx.fillRect(40, 20, 2, 3);

            } else if (type === 'R' || type === 2) {
                ctx.fillStyle = '#90caf9';
                ctx.fillRect(12, 14, 40, 36);
                ctx.fillStyle = '#64b5f6';
                ctx.fillRect(12, 14, 40, 4);
                ctx.fillRect(12, 14, 4, 36);
                ctx.fillStyle = '#42a5f5';
                ctx.fillRect(12, 46, 40, 4);
                ctx.fillRect(48, 14, 4, 36);

                ctx.fillStyle = '#1e88e5';
                ctx.fillRect(18, 20, 28, 24);
                ctx.fillStyle = '#42a5f5';
                ctx.fillRect(18, 20, 28, 3);
                ctx.fillRect(18, 20, 3, 24);
                ctx.fillStyle = '#1565c0';
                ctx.fillRect(18, 41, 28, 3);
                ctx.fillRect(43, 20, 3, 24);

                ctx.strokeStyle = '#bbdefb';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(22, 42);
                ctx.lineTo(32, 22);
                ctx.lineTo(42, 42);
                ctx.stroke();

                ctx.strokeStyle = '#e3f2fd';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(26, 42);
                ctx.lineTo(32, 30);
                ctx.lineTo(38, 42);
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(31, 22, 2, 20);

                ctx.fillStyle = '#e1f5fe';
                for (var sp = 0; sp < 4; sp++) {
                    var sax = 16 + sp * 10;
                    var say = 54;
                    ctx.fillRect(sax, say, 2, 2);
                }
            }

            return canvas;
        }
    }

    window.SpriteFactory = new SpriteFactory();
})();
