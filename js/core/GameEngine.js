"use strict";
(function () {
    class GameEngine {
        constructor() {
            this.running = false;
            this.paused = false;
            this.replayMode = false;
            this.lastTime = 0;
            this.deltaTime = 0;
            this.elapsed = 0;
            this.state = {
                gold: 0,
                hp: 0,
                maxHp: 0,
                levelId: 0,
                waveIdx: 0,
                totalWaves: 0,
                isTrial: false,
                challengeCode: null
            };
            this.selectedTowerType = null;
            this.selectedTower = null;
            this.screen = { shakeT: 0, shakeMag: 0 };
            this.perf = null;
        }

        init(opts) {
            opts = opts || {};
            this.state.gold = opts.gold != null ? opts.gold : 100;
            this.state.hp = opts.hp != null ? opts.hp : 20;
            this.state.maxHp = opts.maxHp != null ? opts.maxHp : this.state.hp;
            this.state.levelId = opts.levelId || 1;
            this.state.totalWaves = opts.totalWaves || 10;
            this.state.isTrial = opts.isTrial || false;
            this.state.challengeCode = opts.challengeCode || null;
            this.state.trialConfig = opts.trialConfig || null;
            this.state.waveIdx = 0;
            this.elapsed = 0;
            this.selectedTowerType = null;
            this.selectedTower = null;
            this.aimingRocket = false;
            this.screen.shakeT = 0;
            this.screen.shakeMag = 0;
            this.paused = false;
            if (typeof window.PerfMonitor !== 'undefined' && this.perf == null) {
                this.perf = new window.PerfMonitor();
            }

            var self = this;
            if (window.EventBus) {
                window.EventBus.on('wave-start', function (w) {
                    self.state.waveIdx = w;
                });
            }

            window.EventBus && window.EventBus.emit('gold-change', this.state.gold);
            window.EventBus && window.EventBus.emit('hp-change', this.state.hp);
            window.EventBus && window.EventBus.emit('wave-change', 0, this.state.totalWaves);
        }

        start() {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
        }

        stop() {
            this.running = false;
        }

        pause() {
            this.paused = true;
        }

        resume() {
            this.paused = false;
            this.lastTime = performance.now();
        }

        loop(timestamp) {
            if (!this.running) return;

            if (this.perf && typeof this.perf.beginFrame === 'function') this.perf.beginFrame();

            var dt = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;
            if (dt > 0.1) dt = 0.1;
            this.deltaTime = dt;

            if (!this.paused) {
                this.update(dt);
            }

            this.render();

            if (this.perf && typeof this.perf.endFrame === 'function') this.perf.endFrame();
            requestAnimationFrame(this.loop.bind(this));
        }

        update(dt) {
            this.elapsed += dt;

            if (this.screen.shakeT > 0) {
                this.screen.shakeT -= dt;
            }

            if (window.SkillSystem && typeof window.SkillSystem.update === 'function') {
                window.SkillSystem.update(dt);
            }
            if (window.WaveSystem && typeof window.WaveSystem.update === 'function') {
                window.WaveSystem.update(dt);
            }
            if (window.EnemySystem && typeof window.EnemySystem.update === 'function') {
                window.EnemySystem.update(dt);
            }
            if (window.TowerSystem && typeof window.TowerSystem.update === 'function') {
                window.TowerSystem.update(dt);
            }
            if (window.ParticleSystem && typeof window.ParticleSystem.update === 'function') {
                window.ParticleSystem.update(dt);
            }

            if (this.isGameOver()) {
                this.triggerDefeat();
                return;
            }

            var allWavesDone = false;
            if (window.WaveSystem && typeof window.WaveSystem.isAllWavesDone === 'function') {
                allWavesDone = window.WaveSystem.isAllWavesDone();
            } else {
                allWavesDone = this.state.waveIdx >= this.state.totalWaves;
            }
            var noAliveEnemies = true;
            if (window.EnemySystem && typeof window.EnemySystem.hasAliveEnemies === 'function') {
                noAliveEnemies = !window.EnemySystem.hasAliveEnemies();
            } else if (window.EnemySystem && typeof window.EnemySystem.getActiveCount === 'function') {
                noAliveEnemies = window.EnemySystem.getActiveCount() === 0;
            }
            if (allWavesDone && noAliveEnemies) {
                this.triggerVictory();
            }
        }

        render() {
            if (window.CanvasRenderer && typeof window.CanvasRenderer.render === 'function') {
                window.CanvasRenderer.render();
            }
        }

        addGold(n) {
            this.state.gold += n;
            window.EventBus.emit('gold-change', this.state.gold);
        }

        takeDamage(n) {
            this.state.hp = Math.max(0, this.state.hp - n);
            window.EventBus.emit('hp-change', this.state.hp);
            this.screenShake(0.2, 4);
        }

        isGameOver() {
            return this.state.hp <= 0;
        }

        triggerVictory() {
            if (!this.running) return;
            this.running = false;

            if (window.SaveManager && typeof window.SaveManager.saveLeaderboardEntry === 'function') {
                window.SaveManager.saveLeaderboardEntry({
                    levelId: this.state.levelId,
                    hp: this.state.hp,
                    maxHp: this.state.maxHp,
                    elapsed: this.elapsed,
                    isTrial: this.state.isTrial,
                    challengeCode: this.state.challengeCode
                });
            }

            window.EventBus.emit('game-victory', {
                levelId: this.state.levelId,
                hp: this.state.hp,
                maxHp: this.state.maxHp,
                elapsed: this.elapsed
            });
        }

        triggerDefeat() {
            if (!this.running) return;
            this.running = false;

            window.EventBus.emit('game-defeat', {
                levelId: this.state.levelId,
                hp: 0,
                maxHp: this.state.maxHp,
                elapsed: this.elapsed
            });
        }

        screenShake(time, magnitude) {
            this.screen.shakeT = time;
            this.screen.shakeMag = magnitude;
        }
    }

    window.GameEngine = new GameEngine();
})();
