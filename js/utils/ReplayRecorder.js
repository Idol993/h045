"use strict";
(function () {
    function ReplayRecorder() {
        this.events = [];
        this.enemyLog = new Map();
        this.startTime = 0;
        this.running = false;
        this.levelId = null;
        this.challengeCode = null;
        this._lastSampleTime = new Map();
    }

    ReplayRecorder.prototype.start = function (levelId, challengeCode) {
        this.events = [];
        this.enemyLog = new Map();
        this._lastSampleTime = new Map();
        this.startTime = performance.now();
        this.running = true;
        this.levelId = levelId;
        this.challengeCode = challengeCode;
        ReplayRecorder.setInstance(this);
    };

    ReplayRecorder.prototype._getElapsed = function () {
        return (performance.now() - this.startTime) / 1000;
    };

    ReplayRecorder.prototype.recordEvent = function (type, data) {
        if (!this.running) return;
        var event = { t: this._getElapsed(), event: type };
        if (data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    event[key] = data[key];
                }
            }
        }
        this.events.push(event);
    };

    ReplayRecorder.prototype.recordEnemySpawn = function (id, type, spawnT) {
        if (!this.running) return;
        this.enemyLog.set(id, {
            id: id,
            type: type,
            spawnT: spawnT,
            path: []
        });
    };

    ReplayRecorder.prototype.recordEnemyPos = function (id, t, x, y) {
        if (!this.running) return;
        var enemy = this.enemyLog.get(id);
        if (!enemy) return;
        var lastSample = this._lastSampleTime.get(id) || 0;
        if (t - lastSample >= 0.2 || enemy.path.length === 0) {
            enemy.path.push({ t: t, x: x, y: y });
            this._lastSampleTime.set(id, t);
        }
    };

    ReplayRecorder.prototype.recordEnemyDeath = function (id, deathT) {
        if (!this.running) return;
        var enemy = this.enemyLog.get(id);
        if (enemy) {
            enemy.deathT = deathT;
        }
    };

    ReplayRecorder.prototype.stop = function (result, stats) {
        if (window.ReplayRecorder) ReplayRecorder.setInstance(null);
        this.running = false;
        var duration = this._getElapsed();
        var enemiesArr = [];
        this.enemyLog.forEach(function (value) {
            enemiesArr.push(value);
        });
        var data = {
            version: 1,
            levelId: this.levelId,
            challengeCode: this.challengeCode,
            duration: duration,
            result: result,
            frames: this.events,
            enemies: enemiesArr
        };
        if (stats) {
            for (var key in stats) {
                if (stats.hasOwnProperty(key)) {
                    data[key] = stats[key];
                }
            }
        }
        return data;
    };

    ReplayRecorder.prototype.exportJSON = function (data) {
        var json = JSON.stringify(data);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'td-replay-' + Date.now() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    ReplayRecorder.prototype.importFromFile = function (file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) {
                try {
                    var data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = function (e) {
                reject(e);
            };
            reader.readAsText(file);
        });
    };

    ReplayRecorder.safeRecord = function (methodName) {
        try {
            if (typeof window.ReplayRecorder === 'undefined') return;
            var rec = window.ReplayRecorder._instance || null;
            if (!rec || !rec.running) return;
            var args = Array.prototype.slice.call(arguments, 1);
            if (typeof rec[methodName] === 'function') {
                rec[methodName].apply(rec, args);
            }
        } catch (e) {
        }
    };
    ReplayRecorder.setInstance = function (rec) {
        window.ReplayRecorder._instance = rec;
    };

    window.ReplayRecorder = ReplayRecorder;
})();
