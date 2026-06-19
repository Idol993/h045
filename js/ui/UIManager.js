"use strict";
(function () {
    var PANEL_IDS = [
        'main-menu', 'level-select', 'trial-panel', 'leaderboard-panel',
        'replay-panel', 'game-screen', 'result-modal', 'tower-popup'
    ];

    class UIManager {
        constructor() {
            this.panels = {};
            this._timeTimer = null;
            this._replayRecorder = null;
            this.initDOMCache();
            this.bindGlobalEvents();
            this.initTowerSlots();
            this.initSkillButtons();
        }

        initDOMCache() {
            for (var i = 0; i < PANEL_IDS.length; i++) {
                var id = PANEL_IDS[i];
                var el = document.getElementById(id);
                if (el) this.panels[id] = el;
            }
        }

        bindGlobalEvents() {
            var self = this;

            if (typeof window.EventBus !== 'undefined') {
                window.EventBus.on('gold-change', function (v) { self.updateGold(v); });
                window.EventBus.on('hp-change', function (v) { self.updateHp(v); });
                window.EventBus.on('wave-start', function (w) { self.updateWave(w); });
                window.EventBus.on('skill-cast', function () { self.refreshSkillUI(); });
            }

            var waveBtn = document.getElementById('wave-btn');
            if (waveBtn) {
                waveBtn.onclick = function () { self.onWaveBtn(); };
            }
            var pauseBtn = document.getElementById('pause-btn');
            if (pauseBtn) {
                pauseBtn.onclick = function () { self.onPauseToggle(); };
            }
            var menuBtn = document.getElementById('menu-btn');
            if (menuBtn) {
                menuBtn.onclick = function () { self.confirmExitGame(); };
            }

            var canvas = document.getElementById('game-canvas');
            if (canvas) {
                canvas.addEventListener('click', function (e) { self.onCanvasClick(e); });
                canvas.addEventListener('mousemove', function (e) { self.onCanvasMove(e); });
                canvas.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    self.cancelTowerPlacement();
                });
            }

            window.addEventListener('keydown', function (e) {
                if (!window.GameEngine || !window.GameEngine.running) return;
                var k = e.key.toUpperCase();
                if (k === 'ESCAPE') {
                    self.cancelTowerPlacement();
                }
                if (k === 'Q' || k === 'E' || k === 'R') {
                    var cv = document.getElementById('game-canvas');
                    if (cv && typeof window.SkillSystem !== 'undefined') {
                        var rect = cv.getBoundingClientRect();
                        var scaleX = 800 / rect.width;
                        var scaleY = 512 / rect.height;
                        var mx = (e.clientX - rect.left) * scaleX;
                        var my = (e.clientY - rect.top) * scaleY;
                        window.SkillSystem.castByKey(k, mx, my);
                        self.refreshSkillUI();
                    }
                }
                if (k === ' ') {
                    e.preventDefault();
                    self.onWaveBtn();
                }
                if (k === 'P') {
                    self.onPauseToggle();
                }
            });

            window.addEventListener('resize', function () { self.onResize(); });
        }

        initTowerSlots() {
            if (typeof window.TOWER_CONFIG === 'undefined') return;
            var bar = document.getElementById('tower-bar');
            if (!bar) return;
            bar.innerHTML = '';
            var types = ['arrow', 'cannon', 'magic'];
            var self = this;
            for (var i = 0; i < types.length; i++) {
                (function (type) {
                    var cfg = window.TOWER_CONFIG[type];
                    var slot = document.createElement('div');
                    slot.className = 'tower-slot';
                    slot.dataset.type = type;
                    slot.innerHTML =
                        '<canvas width="40" height="40"></canvas>' +
                        '<span>' + cfg.name + '</span>' +
                        '<span class="gold-color">$' + cfg.levels[0].cost + '</span>';
                    slot.onclick = function () { self.selectTowerType(type); };
                    bar.appendChild(slot);
                    if (typeof window.SpriteFactory !== 'undefined') {
                        var cv = slot.querySelector('canvas');
                        var cx = cv.getContext('2d');
                        cx.imageSmoothingEnabled = false;
                        try {
                            var sprite = window.SpriteFactory.generateTowerSprite(type, 1);
                            cx.drawImage(sprite, 4, 4, 32, 32);
                        } catch (err) {}
                    }
                })(types[i]);
            }
        }

        initSkillButtons() {
            var btns = document.querySelectorAll('#skill-bar .skill-btn');
            var self = this;
            btns.forEach(function (btn) {
                var type = btn.dataset.type;
                btn.onclick = function () {
                    if (type === 'rocket') {
                        if (window.GameEngine) {
                            window.GameEngine.aimingRocket = window.GameEngine.aimingRocket ? false : true;
                        }
                    } else if (typeof window.SkillSystem !== 'undefined') {
                        window.SkillSystem.castByType(type, 400, 256);
                        self.refreshSkillUI();
                    }
                };
            });
        }

        showPanel(id) {
            for (var pid in this.panels) {
                if (this.panels.hasOwnProperty(pid)) {
                    if (pid === id) {
                        this.panels[pid].classList.remove('hidden');
                    } else {
                        this.panels[pid].classList.add('hidden');
                    }
                }
            }
        }

        hideAllPanels() {
            for (var pid in this.panels) {
                if (this.panels.hasOwnProperty(pid) && pid !== 'game-screen') {
                    this.panels[pid].classList.add('hidden');
                }
            }
        }

        updateGold(v) {
            var el = document.getElementById('gold-val');
            if (el) el.textContent = v;
        }

        updateHp(v) {
            var el = document.getElementById('hp-val');
            if (el) el.textContent = v;
            var bar = document.querySelector('.hp-bar-fill');
            if (!bar) bar = document.getElementById('hp-bar-fill');
            if (bar && window.GameEngine) {
                var maxHp = window.GameEngine.state.maxHp || 20;
                var pct = Math.max(0, Math.min(1, v / maxHp)) * 100;
                bar.style.width = pct + '%';
            }
        }

        updateWave(w) {
            var el = document.getElementById('wave-val');
            if (el && window.WaveSystem) {
                var total = window.WaveSystem.waves ? window.WaveSystem.waves.length : 0;
                el.textContent = w + '/' + total;
            } else if (el) {
                el.textContent = w;
            }
        }

        updateTime() {
            var el = document.getElementById('time-val');
            if (el && window.GameEngine) {
                el.textContent = this.formatTime(window.GameEngine.elapsed);
            }
        }

        updateLevelLabel(lid, isTrial) {
            var el = document.getElementById('level-val');
            if (!el) return;
            if (isTrial) {
                el.textContent = '试炼模式';
            } else {
                var name = '';
                if (typeof window.LEVEL_CONFIG !== 'undefined' && window.LEVEL_CONFIG.levels) {
                    var lv = window.LEVEL_CONFIG.levels[lid - 1];
                    if (lv) name = ' ' + lv.name;
                }
                el.textContent = '第' + lid + '关' + name;
            }
        }

        selectTowerType(type) {
            if (!window.GameEngine) return;
            window.GameEngine.selectedTower = null;
            var slots = document.querySelectorAll('.tower-slot');
            if (window.GameEngine.selectedTowerType === type) {
                window.GameEngine.selectedTowerType = null;
                slots.forEach(function (s) { s.classList.remove('selected'); });
            } else {
                window.GameEngine.selectedTowerType = type;
                slots.forEach(function (s) {
                    s.classList.toggle('selected', s.dataset.type === type);
                });
            }
        }

        cancelTowerPlacement() {
            if (window.GameEngine) {
                window.GameEngine.selectedTowerType = null;
                window.GameEngine.selectedTower = null;
                window.GameEngine.aimingRocket = false;
            }
            document.querySelectorAll('.tower-slot').forEach(function (s) {
                s.classList.remove('selected');
            });
            this.hideTowerPopup();
        }

        getCanvasPos(clientX, clientY) {
            var canvas = document.getElementById('game-canvas');
            if (!canvas) return [0, 0];
            var rect = canvas.getBoundingClientRect();
            var scaleX = 800 / rect.width;
            var scaleY = 512 / rect.height;
            return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
        }

        onCanvasMove(e) {
            var pos = this.getCanvasPos(e.clientX, e.clientY);
            var mx = pos[0], my = pos[1];
            if (typeof window.CanvasRenderer !== 'undefined') {
                window.CanvasRenderer._mouseX = mx;
                window.CanvasRenderer._mouseY = my;
            }
            if (typeof window.SkillSystem !== 'undefined' && window.GameEngine) {
                window.SkillSystem.setRocketCursor(mx, my, window.GameEngine.aimingRocket === true);
            }
        }

        onCanvasClick(e) {
            var pos = this.getCanvasPos(e.clientX, e.clientY);
            var mx = pos[0], my = pos[1];
            if (window.GameEngine && window.GameEngine.aimingRocket &&
                typeof window.SkillSystem !== 'undefined' &&
                window.SkillSystem.skills && window.SkillSystem.skills.rocket &&
                window.SkillSystem.skills.rocket.isReady) {
                window.SkillSystem.castByType('rocket', mx, my);
                window.GameEngine.aimingRocket = false;
                this.refreshSkillUI();
                return;
            }
            var gridPos;
            if (typeof window.CanvasRenderer !== 'undefined') {
                gridPos = window.CanvasRenderer.worldToGrid(mx, my);
            } else {
                var TILE = window.TILE || 32;
                gridPos = [Math.floor(mx / TILE), Math.floor(my / TILE)];
            }
            var gx = gridPos[0], gy = gridPos[1];
            if (window.GameEngine && window.GameEngine.selectedTowerType) {
                if (typeof window.TowerSystem !== 'undefined') {
                    window.TowerSystem.placeTower(gx, gy, window.GameEngine.selectedTowerType);
                }
                return;
            }
            if (typeof window.TowerSystem !== 'undefined') {
                var t = window.TowerSystem.getTowerAt(gx, gy);
                if (t) {
                    window.GameEngine.selectedTower = t;
                    this.showTowerPopup(t);
                } else {
                    window.GameEngine.selectedTower = null;
                    this.hideTowerPopup();
                }
            }
        }

        showTowerPopup(tower) {
            if (typeof window.TOWER_CONFIG === 'undefined') return;
            var pop = document.getElementById('tower-popup');
            if (!pop) return;
            var cfg = window.TOWER_CONFIG[tower.type];
            var s = tower.stats;
            var nlCost = tower.nextLevelCost;
            pop.classList.remove('hidden');
            pop.style.left = '50%';
            pop.style.top = '50%';
            var self = this;
            var upgradeHtml = nlCost !== null
                ? '<button class="pixel-btn" id="tower-upgrade-btn">升级 ($' + nlCost + ')</button>'
                : '<span style="color:#ffd700">已满级</span>';
            pop.innerHTML =
                '<h3>' + cfg.name + ' Lv.' + (tower.level + 1) + '</h3>' +
                '<p>攻击: ' + s.damage + ' | 攻速: ' + s.attackSpeed.toFixed(1) + '/s | 射程: ' + s.range.toFixed(1) + '</p>' +
                '<p>' + (s.desc || '') + '</p>' +
                '<div class="row">' +
                    upgradeHtml +
                    '<button class="pixel-btn" style="background:#f44336" id="tower-sell-btn">出售 (+$' + tower.sellValue() + ')</button>' +
                    '<button class="pixel-btn" id="tower-close-btn">关闭</button>' +
                '</div>';
            var closeBtn = document.getElementById('tower-close-btn');
            if (closeBtn) closeBtn.onclick = function () { self.hideTowerPopup(); };
            var sellBtn = document.getElementById('tower-sell-btn');
            if (sellBtn) sellBtn.onclick = function () {
                if (typeof window.TowerSystem !== 'undefined') {
                    window.TowerSystem.removeTower(tower);
                }
                if (window.GameEngine) window.GameEngine.selectedTower = null;
                self.hideTowerPopup();
            };
            if (nlCost !== null) {
                var upgradeBtn = document.getElementById('tower-upgrade-btn');
                if (upgradeBtn) upgradeBtn.onclick = function () {
                    if (tower.upgrade()) self.showTowerPopup(tower);
                };
            }
        }

        hideTowerPopup() {
            var pop = document.getElementById('tower-popup');
            if (pop) pop.classList.add('hidden');
        }

        stopReplay(win, stats) {
            if (this._replayRecorder && typeof window.ReplayRecorder !== 'undefined') {
                try {
                    return this._replayRecorder.stop(win ? 'win' : 'lose', stats);
                } catch (e) {}
            }
            return null;
        }

        onWaveBtn() {
            if (typeof window.WaveSystem === 'undefined') return;
            if (!window.WaveSystem.waveActive) {
                window.WaveSystem.requestStartNextWave();
                var wb = document.getElementById('wave-btn');
                if (wb) {
                    wb.disabled = true;
                    setTimeout(function () { wb.disabled = false; }, 500);
                }
            }
        }

        onPauseToggle() {
            if (!window.GameEngine) return;
            if (window.GameEngine.paused) {
                window.GameEngine.resume();
            } else {
                window.GameEngine.pause();
            }
            var pb = document.getElementById('pause-btn');
            if (pb) {
                pb.textContent = window.GameEngine.paused ? '▶ 继续' : '⏸ 暂停';
            }
        }

        confirmExitGame() {
            if (confirm('确定退出当前游戏返回主菜单？进度不会保存。')) {
                if (window.GameEngine) window.GameEngine.stop();
                this.showPanel('main-menu');
            }
        }

        refreshSkillUI() {
            if (typeof window.SkillSystem === 'undefined') return;
            document.querySelectorAll('#skill-bar .skill-btn').forEach(function (btn) {
                var type = btn.dataset.type;
                var sk = window.SkillSystem.skills[type];
                if (!sk) return;
                var mask = btn.querySelector('.cd-mask');
                if (mask && sk.config) {
                    var pct = Math.max(0, Math.min(1, sk.cd / sk.config.cd)) * 100;
                    mask.style.height = pct + '%';
                }
                btn.classList.toggle('cooling', !sk.isReady);
            });
        }

        onResize() {
            if (typeof window.CanvasRenderer !== 'undefined') {
                window.CanvasRenderer.resize(window.innerWidth, window.innerHeight - 150);
            }
        }

        _onGameEnd(win, data) {
            if (!window.GameEngine) return;
            var stats = {
                levelId: window.GameEngine.state.levelId,
                isTrial: window.GameEngine.state.isTrial,
                wavesDone: window.GameEngine.state.waveIdx,
                totalWaves: window.GameEngine.state.totalWaves,
                endHp: data.hp,
                finalGold: window.GameEngine.state.gold,
                startHp: data.maxHp,
                duration: data.elapsed
            };
            if (this._replayRecorder && typeof window.ReplayRecorder !== 'undefined') {
                try {
                    var replayData = this._replayRecorder.stop(win ? 'win' : 'lose', stats);
                    stats._replayData = replayData;
                } catch (err) {}
            }
            this.showResult(win, stats);
        }

        showResult(win, stats) {
            var modal = document.getElementById('result-modal');
            if (!modal) return;
            modal.classList.remove('hidden');
            var titleEl = modal.querySelector('.result-title');
            if (titleEl) {
                titleEl.textContent = win ? '🏆 通关胜利！' : '💀 防御失败';
                titleEl.style.color = win ? '#4caf50' : '#f44336';
            }
            var statsEl = modal.querySelector('.result-stats');
            if (statsEl) {
                statsEl.innerHTML =
                    '<p>关卡: ' + (stats.levelId || '试炼') + '</p>' +
                    '<p>波次: ' + stats.wavesDone + ' / ' + stats.totalWaves + '</p>' +
                    '<p>剩余血量: <span class="hp-color">' + stats.endHp + ' ❤️</span></p>' +
                    '<p>剩余金币: <span class="gold-color">$' + stats.finalGold + '</span></p>' +
                    '<p>总用时: ' + this.formatTime(stats.duration) + '</p>';
            }
            var self = this;
            var backBtn = modal.querySelector('#result-back-btn');
            if (backBtn) {
                backBtn.onclick = function () {
                    modal.classList.add('hidden');
                    if (window.GameEngine) window.GameEngine.stop();
                    self.showPanel('main-menu');
                };
            }
            var retryBtn = modal.querySelector('#result-retry-btn');
            if (retryBtn) {
                retryBtn.onclick = function () {
                    modal.classList.add('hidden');
                    self.restartCurrentGame();
                };
            }
            var saveReplayBtn = modal.querySelector('#result-save-replay-btn');
            if (saveReplayBtn) {
                saveReplayBtn.onclick = function () {
                    if (typeof window.ReplayRecorder !== 'undefined') {
                        var data = stats._replayData;
                        if (!data && self._replayRecorder) {
                            data = self._replayRecorder.stop(win ? 'win' : 'lose', stats);
                        }
                        if (data) {
                            var rec = new window.ReplayRecorder();
                            rec.exportJSON(data);
                        }
                    }
                };
            }
        }

        formatTime(s) {
            var m = Math.floor(s / 60);
            var sec = Math.floor(s % 60);
            return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
        }

        restartCurrentGame() {
            if (!window.GameEngine) return;
            var s = window.GameEngine.state;
            this.startGame({
                levelId: s.levelId,
                isTrial: s.isTrial,
                challengeCode: s.challengeCode,
                trialConfig: s.trialConfig
            });
        }

        startGame(opts) {
            opts = opts || {};
            this.hideAllPanels();
            this.showPanel('game-screen');

            var levelCfg, waves, startGold, startHp, mapGrid, levelId, isTrial = false;
            var trialConfig = null, chCode = null;

            if (opts.isTrial) {
                levelId = 0;
                isTrial = true;
                chCode = opts.challengeCode;
                trialConfig = opts.trialConfig;
                if (typeof window.LEVEL_CONFIG !== 'undefined' && window.LEVEL_CONFIG.levels) {
                    var lv1 = window.LEVEL_CONFIG.levels[0];
                    if (lv1) {
                        mapGrid = lv1.map;
                        startGold = 500;
                        startHp = 20;
                    }
                }
                waves = null;
            } else {
                levelId = opts.levelId || 1;
                if (typeof window.LEVEL_CONFIG !== 'undefined' && window.LEVEL_CONFIG.levels) {
                    levelCfg = window.LEVEL_CONFIG.levels[levelId - 1];
                    if (levelCfg) {
                        mapGrid = levelCfg.map;
                        startGold = levelCfg.startGold;
                        startHp = levelCfg.startHp;
                        waves = levelCfg.waves;
                    }
                }
            }

            if (typeof window.GameMap !== 'undefined') {
                window.GameMap.init(mapGrid);
            }
            if (typeof window.TowerSystem !== 'undefined') {
                window.TowerSystem.init();
            }
            if (typeof window.EnemySystem !== 'undefined') {
                window.EnemySystem.init();
            }
            if (typeof window.SkillSystem !== 'undefined') {
                window.SkillSystem.init();
            }
            if (typeof window.WaveSystem !== 'undefined') {
                window.WaveSystem.init(waves, trialConfig);
                var tw = window.WaveSystem.waves ? window.WaveSystem.waves.length : 0;
            }

            if (typeof window.ReplayRecorder !== 'undefined') {
                this._replayRecorder = new window.ReplayRecorder();
                this._replayRecorder.start(levelId, chCode);
            }

            if (window.GameEngine) {
                window.GameEngine.init({
                    levelId: levelId,
                    gold: startGold,
                    hp: startHp,
                    maxHp: startHp,
                    totalWaves: tw || 10,
                    isTrial: isTrial,
                    challengeCode: chCode,
                    trialConfig: trialConfig
                });
                this.updateGold(startGold);
                this.updateHp(startHp);
                this.updateLevelLabel(levelId, isTrial);
                this.updateWave(0);
                this.onResize();
                this.refreshSkillUI();
                window.GameEngine.start();
            }

            if (this._timeTimer) clearInterval(this._timeTimer);
            var self = this;
            this._timeTimer = setInterval(function () {
                if (window.GameEngine && window.GameEngine.running) {
                    self.updateTime();
                }
                self.refreshSkillUI();
            }, 500);

            // 绘制技能图标到每个技能按钮的 canvas 上
            if (typeof window.SpriteFactory !== 'undefined' &&
                typeof window.SpriteFactory.generateSkillIcon === 'function') {
                var sf = window.SpriteFactory;
                var types = ['freeze', 'rocket', 'heal'];
                document.querySelectorAll('#skill-bar .skill-btn').forEach(function (btn) {
                    var cvs = btn.querySelector('.skill-canvas');
                    var type = btn.dataset.type;
                    if (cvs && type) {
                        try {
                            var cx = cvs.getContext('2d');
                            cx.imageSmoothingEnabled = false;
                            cx.clearRect(0, 0, 64, 64);
                            var icon = sf.generateSkillIcon(type);
                            if (icon) cx.drawImage(icon, 0, 0, 64, 64);
                        } catch (err) {}
                    }
                });
            }
        }

        tick() {
            var wb = document.getElementById('wave-btn');
            if (!wb || typeof window.WaveSystem === 'undefined') return;
            if (window.WaveSystem.waveActive) {
                wb.textContent = '⚔️ 第 ' + (window.WaveSystem.currentWave + 1) + ' 波进行中';
                wb.disabled = true;
            } else {
                var next = window.WaveSystem.currentWave + 2;
                var total = window.WaveSystem.waves ? window.WaveSystem.waves.length : 0;
                if (next > total) {
                    wb.textContent = '✅ 全部完成';
                    wb.disabled = true;
                } else {
                    wb.textContent = '▶ 开始第 ' + next + ' 波 (空格)';
                    wb.disabled = false;
                }
            }
        }
    }

    window.UIManager = new UIManager();
})();
