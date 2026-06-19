"use strict";
(function () {
    var TILE = window.TILE || 32;

    class WaveSystem {
        constructor() {
            this.waves = [];
            this.currentWave = -1;
            this.waveActive = false;
            this.spawnQueue = [];
            this.spawnTimer = 0;
            this.pendingWaves = 0;
            this.startRequested = false;
            this.mainPath = null;
        }

        init(levelWaves, trialConfig) {
            this.currentWave = -1;
            this.waveActive = false;
            this.spawnQueue = [];
            this.spawnTimer = 0;
            this.startRequested = false;
            this.mainPath = null;

            if (trialConfig && trialConfig.waves) {
                this.waves = this._buildTrialWaves(trialConfig);
            } else {
                this.waves = levelWaves || [];
            }
            this.pendingWaves = this.waves.length;
            GameEngine.state.totalWaves = this.waves.length;

            var self = this;
            PathManager.getMainPath(function (p) {
                self.mainPath = PathManager.gridPathToWorld(p);
            });
        }

        _buildTrialWaves(trial) {
            var waves = [];
            var seed = trial.seed || 12345;
            var rng = function () {
                seed = (seed * 9301 + 49297) % 233280;
                return seed / 233280;
            };

            for (var w = 0; w < trial.w; w++) {
                var cfg = trial.waves[w] || { count: 10, ratio: { normal: 1 } };
                var enemies = [];
                var remaining = cfg.count;
                var types = [];
                var ratios = [];
                for (var t in cfg.ratio) {
                    if (cfg.ratio.hasOwnProperty(t) && cfg.ratio[t] > 0) {
                        types.push(t);
                        ratios.push(cfg.ratio[t]);
                    }
                }
                var ratioSum = 0;
                for (var i = 0; i < ratios.length; i++) ratioSum += ratios[i];
                if (ratioSum === 0) ratioSum = 1;

                for (var j = 0; j < types.length; j++) {
                    var n;
                    if (j === types.length - 1) {
                        n = remaining;
                    } else {
                        n = Math.round(cfg.count * ratios[j] / ratioSum);
                        remaining -= n;
                    }
                    for (var k = 0; k < n; k++) {
                        enemies.push({ type: types[j] });
                    }
                }

                for (var m = enemies.length - 1; m > 0; m--) {
                    var j2 = Math.floor(rng() * (m + 1));
                    var tmp = enemies[m];
                    enemies[m] = enemies[j2];
                    enemies[j2] = tmp;
                }

                var interval = Math.max(0.3, 1.2 - w * 0.03);
                var waveEnemies = [];
                for (var idx = 0; idx < enemies.length; idx++) {
                    waveEnemies.push({
                        type: enemies[idx].type,
                        interval: interval
                    });
                }
                waves.push({
                    enemies: waveEnemies,
                    delay: 3
                });
            }
            return waves;
        }

        requestStartNextWave() {
            if (this.waveActive) return false;
            if (this.currentWave + 1 >= this.waves.length) return false;
            this.startRequested = true;
            return true;
        }

        startNextWave() {
            this.currentWave++;
            this.waveActive = true;
            GameEngine.state.waveIdx = this.currentWave + 1;
            var wave = this.waves[this.currentWave];
            this.spawnQueue = [];
            var cumT = 0;
            for (var i = 0; i < wave.enemies.length; i++) {
                var e = wave.enemies[i];
                cumT += (e.interval || 0.8);
                this.spawnQueue.push({ type: e.type, t: cumT });
            }
            this.spawnTimer = 0;
            EventBus.emit('wave-start', this.currentWave + 1);
            window.ReplayRecorder.safeRecord('recordEvent', 'wave_start', {
                wave: this.currentWave + 1,
                count: wave.enemies.length
            });
        }

        isWaveCleared() {
            return this.waveActive && this.spawnQueue.length === 0 && EnemySystem.getActiveCount() === 0;
        }

        update(dt) {
            if (!this.mainPath) {
                var self = this;
                PathManager.getMainPath(function (p) {
                    self.mainPath = PathManager.gridPathToWorld(p);
                });
                return;
            }
            if (this.startRequested && !this.waveActive) {
                this.startRequested = false;
                this.startNextWave();
            }
            if (!this.waveActive) return;
            this.spawnTimer += dt;

            while (this.spawnQueue.length > 0 && this.spawnQueue[0].t <= this.spawnTimer) {
                var s = this.spawnQueue.shift();
                EnemySystem.spawn(s.type, this.mainPath);
            }

            if (this.isWaveCleared()) {
                this.waveActive = false;
                this.pendingWaves--;
                EventBus.emit('wave-end', this.currentWave + 1);
                window.ReplayRecorder.safeRecord('recordEvent', 'wave_end', { wave: this.currentWave + 1 });
                GameEngine.addGold(20 + this.currentWave * 5);
            }
        }

        isAllWavesDone() {
            return this.currentWave + 1 >= this.waves.length &&
                !this.waveActive &&
                EnemySystem.getActiveCount() === 0;
        }
    }

    window.WaveSystem = new WaveSystem();
})();
