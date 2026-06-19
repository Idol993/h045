"use strict";
(function () {
    class LevelSelect {
        refresh() {
            var grid = document.getElementById('level-grid');
            var backBtn = document.getElementById('ls-back-btn');
            if (!grid) return;

            grid.innerHTML = '';

            var levels = [];
            if (typeof window.LEVEL_CONFIG !== 'undefined' &&
                Array.isArray(window.LEVEL_CONFIG.levels)) {
                levels = window.LEVEL_CONFIG.levels;
            }
            var total = Math.min(levels.length, 10);

            var unlockedLevel = 1;
            var levelStars = {};
            if (typeof window.SaveManager !== 'undefined') {
                if (typeof window.SaveManager.getUnlockedLevel === 'function') {
                    try {
                        var v = window.SaveManager.getUnlockedLevel();
                        if (typeof v === 'number' && v > 0) unlockedLevel = v;
                    } catch (e) {}
                }
                if (typeof window.SaveManager.getLevelStars === 'function') {
                    try {
                        var s = window.SaveManager.getLevelStars();
                        if (s && typeof s === 'object') levelStars = s;
                    } catch (e) {}
                }
            }

            for (var i = 1; i <= total; i++) {
                var lv = levels[i - 1] || {};
                var btn = document.createElement('button');
                var isUnlocked = i <= unlockedLevel;
                btn.className = 'level-btn pixel-btn' + (isUnlocked ? '' : ' locked');

                var starCount = 0;
                if (levelStars[i] != null) starCount = parseInt(levelStars[i], 10) || 0;
                var starStr = '';
                for (var s = 0; s < starCount; s++) starStr += '★';
                for (var s2 = starCount; s2 < 3; s2++) starStr += '☆';

                btn.innerHTML =
                    '<div class="lv-num">' + i + (isUnlocked ? '' : ' 🔒') + '</div>' +
                    '<div class="lv-name">' + (lv.name || ('关卡 ' + i)) + '</div>' +
                    '<div class="lv-stars">' + starStr + '</div>';

                if (isUnlocked) {
                    (function (levelId) {
                        btn.onclick = function () {
                            if (typeof window.UIManager !== 'undefined' &&
                                typeof window.UIManager.startGame === 'function') {
                                window.UIManager.startGame({ levelId: levelId });
                            }
                        };
                    })(i);
                }

                grid.appendChild(btn);
            }

            if (backBtn) {
                backBtn.onclick = function () {
                    if (typeof window.UIManager !== 'undefined' &&
                        typeof window.UIManager.showPanel === 'function') {
                        window.UIManager.showPanel('main-menu');
                    }
                };
            }
        }
    }

    window.LevelSelect = new LevelSelect();
})();
