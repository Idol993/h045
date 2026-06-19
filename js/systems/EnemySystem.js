"use strict";
(function () {
    var TILE = window.TILE || 32;

    class EnemySystem {
        constructor() {
            this.pool = new ObjectPool(
                function () { return new Enemy(); },
                function (e, opts) { e.reset(opts); },
                200
            );
            this.activeEnemies = [];
            this.spawnCount = 0;
        }

        init() {
            for (var i = 0; i < this.activeEnemies.length; i++) {
                this.activeEnemies[i]._active = false;
            }
            this.activeEnemies = [];
            this.spawnCount = 0;
        }

        spawn(type, startPath) {
            if (this.activeEnemies.length >= 200) {
                var minIdx = 0, minP = 1;
                for (var i = 0; i < this.activeEnemies.length; i++) {
                    if (this.activeEnemies[i].pathProgress < minP) {
                        minP = this.activeEnemies[i].pathProgress;
                        minIdx = i;
                    }
                }
                var victim = this.activeEnemies[minIdx];
                victim._active = false;
                this.activeEnemies.splice(minIdx, 1);
            }

            var enemy;
            try {
                enemy = this.pool.acquire({ type: type });
            } catch (e) {
                enemy = new Enemy();
                enemy.reset({ type: type });
                enemy._active = true;
                enemy._pooled = false;
            }

            if (startPath && startPath.length > 0) {
                enemy.x = startPath[0].x;
                enemy.y = startPath[0].y;
                enemy.path = startPath.slice();
                enemy.pathIdx = 1;
            }

            this.activeEnemies.push(enemy);
            this.spawnCount++;

            window.ReplayRecorder.safeRecord('recordEnemySpawn', enemy.id, type, window.GameEngine.elapsed);

            enemy._nextLogT = 0.2;
            return enemy;
        }

        onEnemyDeath(enemy) {
            var idx = this.activeEnemies.indexOf(enemy);
            if (idx >= 0) this.activeEnemies.splice(idx, 1);
            try {
                this.pool.release(enemy);
            } catch (e) { }
        }

        getActiveCount() {
            var count = 0;
            for (var i = 0; i < this.activeEnemies.length; i++) {
                if (this.activeEnemies[i]._active) count++;
            }
            return count;
        }

        hasAliveEnemies() {
            for (var i = 0; i < this.activeEnemies.length; i++) {
                if (this.activeEnemies[i]._active && this.activeEnemies[i].hp > 0) return true;
            }
            return false;
        }

        update(dt) {
            for (var i = this.activeEnemies.length - 1; i >= 0; i--) {
                var e = this.activeEnemies[i];
                e.update(dt);

                e._nextLogT -= dt;
                if (e._nextLogT <= 0) {
                    e._nextLogT = 0.2;
                    window.ReplayRecorder.safeRecord('recordEnemyPos', e.id, window.GameEngine.elapsed, e.x, e.y);
                }
            }
        }

        render(ctx) {
            for (var i = 0; i < this.activeEnemies.length; i++) {
                this.activeEnemies[i].render(ctx);
            }
        }
    }

    window.EnemySystem = new EnemySystem();
})();
