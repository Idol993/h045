"use strict";
(function () {
    var menuStars = [];
    var MENU_STAR_COUNT = 80;
    var menuCanvas = null;
    var menuCtx = null;
    var menuAnimRunning = false;
    var menuAnimId = null;

    function _ref(obj) { return obj; }

    function _patchGameEngine() {
        if (typeof window.GameEngine === 'undefined') return;

        var engine = window.GameEngine;

        var origUpdate = engine.update.bind(engine);
        engine.update = function (dt) {
            origUpdate(dt);
            if (typeof window.EventBus !== 'undefined' && typeof window.EventBus.emit === 'function') {
                window.EventBus.emit('frame-update', dt);
            }
        };

        var origTriggerVictory = engine.triggerVictory.bind(engine);
        engine.triggerVictory = function () {
            if (!engine.running) return;
            engine.running = false;

            var wavesDone = engine.state.waveIdx || 0;
            var totalWaves = engine.state.totalWaves || 0;
            var stats = {
                levelId: engine.state.levelId,
                startHp: engine.state.maxHp,
                endHp: engine.state.hp,
                duration: engine.elapsed,
                wavesDone: wavesDone,
                totalWaves: totalWaves,
                isTrial: engine.state.isTrial,
                challengeCode: engine.state.challengeCode
            };

            if (typeof window.EventBus !== 'undefined' && typeof window.EventBus.emit === 'function') {
                window.EventBus.emit('game-victory', stats);
            }
        };

        var origTriggerDefeat = engine.triggerDefeat.bind(engine);
        engine.triggerDefeat = function () {
            if (!engine.running) return;
            engine.running = false;

            var wavesDone = engine.state.waveIdx || 0;
            var totalWaves = engine.state.totalWaves || 0;
            var stats = {
                levelId: engine.state.levelId,
                startHp: engine.state.maxHp,
                endHp: 0,
                duration: engine.elapsed,
                wavesDone: wavesDone,
                totalWaves: totalWaves,
                isTrial: engine.state.isTrial,
                challengeCode: engine.state.challengeCode
            };

            if (typeof window.EventBus !== 'undefined' && typeof window.EventBus.emit === 'function') {
                window.EventBus.emit('game-defeat', stats);
            }
        };
    }

    function _subscribeUIManagerTick() {
        if (typeof window.EventBus === 'undefined') return;
        if (typeof window.UIManager === 'undefined') return;
        if (typeof window.UIManager.tick !== 'function') return;
        window.EventBus.on('frame-update', function (dt) {
            window.UIManager.tick(dt);
        });
    }

    function _subscribeGameEvents() {
        if (typeof window.EventBus === 'undefined') return;

        window.EventBus.on('game-victory', async function (stats) {
            if (typeof window.UIManager !== 'undefined' &&
                typeof window.UIManager.stopReplay === 'function') {
                stats._replayData = window.UIManager.stopReplay(true, stats);
            }

            if (typeof window.SaveManager !== 'undefined') {
                if (typeof window.SaveManager.unlockLevel === 'function' && stats.levelId != null) {
                    window.SaveManager.unlockLevel(stats.levelId + 1);
                }
                var stars = 0;
                if (typeof window.SaveManager.calcStars === 'function') {
                    stars = window.SaveManager.calcStars(stats.endHp, stats.startHp);
                }
                if (typeof window.SaveManager.setLevelStars === 'function' && stats.levelId > 0) {
                    window.SaveManager.setLevelStars(stats.levelId, stars);
                }
            }

            if (typeof window.IndexedDBManager !== 'undefined' &&
                typeof window.IndexedDBManager.trySaveScore === 'function' &&
                (stats.levelId > 0 || stats.isTrial)) {
                await window.IndexedDBManager.trySaveScore({
                    levelId: stats.levelId,
                    startHp: stats.startHp,
                    endHp: stats.endHp,
                    duration: stats.duration,
                    wavesDone: stats.wavesDone,
                    totalWaves: stats.totalWaves,
                    isTrial: stats.isTrial,
                    date: Date.now()
                });
            }

            if (typeof window.UIManager !== 'undefined' &&
                typeof window.UIManager.showResult === 'function') {
                window.UIManager.showResult(true, stats);
            }
        });

        window.EventBus.on('game-defeat', function (stats) {
            if (typeof window.UIManager !== 'undefined' &&
                typeof window.UIManager.stopReplay === 'function') {
                stats._replayData = window.UIManager.stopReplay(false, stats);
            }

            if (typeof window.UIManager !== 'undefined' &&
                typeof window.UIManager.showResult === 'function') {
                window.UIManager.showResult(false, stats);
            }
        });
    }

    function _initCanvasSize() {
        var canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        function resize() {
            var container = document.getElementById('game-container');
            if (!container) return;
            var w = Math.min(window.innerWidth, 1280);
            var h = Math.min(window.innerHeight - 120, 720);
            var scale = Math.min(w / 1280, h / 720);
            canvas.style.width = (1280 * scale) + 'px';
            canvas.style.height = (720 * scale) + 'px';
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
        }
        resize();
        window.addEventListener('resize', resize);
    }

    function _initMenuStars() {
        menuCanvas = document.createElement('canvas');
        menuCanvas.style.position = 'absolute';
        menuCanvas.style.top = '0';
        menuCanvas.style.left = '0';
        menuCanvas.style.width = '100%';
        menuCanvas.style.height = '100%';
        menuCanvas.style.pointerEvents = 'none';
        menuCanvas.style.zIndex = '0';

        var container = document.getElementById('main-menu');
        if (container) {
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            container.insertBefore(menuCanvas, container.firstChild);
        }

        menuCtx = menuCanvas.getContext('2d');
        _resizeMenuCanvas();
        window.addEventListener('resize', _resizeMenuCanvas);

        for (var i = 0; i < MENU_STAR_COUNT; i++) {
            menuStars.push({
                x: Math.random() * menuCanvas.width,
                y: Math.random() * menuCanvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.3 + 0.1,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleDir: 1
            });
        }

        _startMenuAnim();
    }

    function _resizeMenuCanvas() {
        if (!menuCanvas) return;
        var dpr = window.devicePixelRatio || 1;
        var container = document.getElementById('main-menu');
        if (!container) return;
        var rect = container.getBoundingClientRect();
        menuCanvas.width = rect.width * dpr;
        menuCanvas.height = rect.height * dpr;
        menuCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function _startMenuAnim() {
        if (menuAnimRunning) return;
        menuAnimRunning = true;
        function _tick() {
            if (!menuAnimRunning) return;
            _renderMenuStars();
            menuAnimId = requestAnimationFrame(_tick);
        }
        _tick();
    }

    function _stopMenuAnim() {
        menuAnimRunning = false;
        if (menuAnimId != null) {
            cancelAnimationFrame(menuAnimId);
            menuAnimId = null;
        }
    }

    function _renderMenuStars() {
        if (!menuCtx || !menuCanvas) return;
        var w = menuCanvas.width / (window.devicePixelRatio || 1);
        var h = menuCanvas.height / (window.devicePixelRatio || 1);
        menuCtx.clearRect(0, 0, w, h);

        for (var i = 0; i < menuStars.length; i++) {
            var s = menuStars[i];
            s.y += s.speed;
            if (s.y > h) {
                s.y = -2;
                s.x = Math.random() * w;
            }
            s.brightness += s.twinkleSpeed * s.twinkleDir;
            if (s.brightness >= 1) {
                s.brightness = 1;
                s.twinkleDir = -1;
            } else if (s.brightness <= 0.3) {
                s.brightness = 0.3;
                s.twinkleDir = 1;
            }
            var alpha = 0.4 + s.brightness * 0.6;
            menuCtx.fillStyle = 'rgba(255, 255, 200, ' + alpha + ')';
            menuCtx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
        }
    }

    function _showMainMenu() {
        if (typeof window.MainMenu !== 'undefined' &&
            typeof window.MainMenu.show === 'function') {
            window.MainMenu.show();
        } else {
            var menu = document.getElementById('main-menu');
            if (menu) menu.classList.remove('hidden');
        }
    }

    function _ensureInstances() {
        _ref(window.EventBus);
        _ref(window.SpriteFactory);
        _ref(window.ParticleSystem);
        _ref(window.CanvasRenderer);
        _ref(window.GameMap);
        _ref(window.PathManager);
        _ref(window.TowerSystem);
        _ref(window.EnemySystem);
        _ref(window.SkillSystem);
        _ref(window.WaveSystem);
        _ref(window.IndexedDBManager);
        _ref(window.SaveManager);
        _ref(window.ReplayRecorder);
        _ref(window.PerfMonitor);
        _ref(window.UIManager);
        _ref(window.MainMenu);
        _ref(window.LevelSelect);
        _ref(window.TrialMode);
        _ref(window.Leaderboard);
        _ref(window.ReplayPanel);
        _ref(window.GameEngine);
    }

    function _init() {
        _ensureInstances();
        _patchGameEngine();
        _subscribeUIManagerTick();
        _subscribeGameEvents();
        _initCanvasSize();
        _initMenuStars();
        _showMainMenu();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }
})();
