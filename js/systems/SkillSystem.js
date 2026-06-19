"use strict";
(function () {
    var TILE = window.TILE || 32;

    class SkillSystem {
        constructor() {
            this.skills = {
                freeze: new Skill('freeze'),
                rocket: new Skill('rocket'),
                heal: new Skill('heal')
            };
            this.healGoldBonus = 0;
            this.rocketCursor = { x: -1, y: -1, visible: false };
        }

        init() {
            this.skills.freeze.cd = 0;
            this.skills.rocket.cd = 0;
            this.skills.heal.cd = 0;
            this.healGoldBonus = 0;
        }

        castByKey(key, mouseX, mouseY) {
            key = key.toUpperCase();
            if (key === 'Q') return this.skills.freeze.tryCast(mouseX, mouseY);
            if (key === 'E') return this.skills.rocket.tryCast(mouseX, mouseY);
            if (key === 'R') return this.skills.heal.tryCast(mouseX, mouseY);
            return false;
        }

        castByType(type, mouseX, mouseY) {
            var s = this.skills[type];
            if (s) return s.tryCast(mouseX, mouseY);
            return false;
        }

        setRocketCursor(x, y, visible) {
            this.rocketCursor.x = x;
            this.rocketCursor.y = y;
            this.rocketCursor.visible = visible;
        }

        update(dt) {
            for (var key in this.skills) {
                if (this.skills.hasOwnProperty(key)) {
                    this.skills[key].update(dt);
                }
            }
            if (this.healGoldBonus > 0) {
                this.healGoldBonus = Math.max(0, this.healGoldBonus - dt);
            }
        }

        render(ctx) {
            this.skills.freeze.renderOverlay(ctx);

            if (this.rocketCursor.visible && this.skills.rocket.isReady) {
                var r = SKILL_CONFIG.rocket.radius;
                ctx.save();
                ctx.strokeStyle = 'rgba(255,87,34,0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.arc(this.rocketCursor.x, this.rocketCursor.y, r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(255,87,34,0.15)';
                ctx.fill();
                ctx.setLineDash([]);
                ctx.strokeStyle = '#ff5722';
                ctx.beginPath();
                ctx.moveTo(this.rocketCursor.x - 12, this.rocketCursor.y);
                ctx.lineTo(this.rocketCursor.x + 12, this.rocketCursor.y);
                ctx.moveTo(this.rocketCursor.x, this.rocketCursor.y - 12);
                ctx.lineTo(this.rocketCursor.x, this.rocketCursor.y + 12);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    window.SkillSystem = new SkillSystem();
})();
