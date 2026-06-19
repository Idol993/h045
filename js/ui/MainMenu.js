"use strict";
(function () {
    class MainMenu {
        constructor() {
            var self = this;
            var init = function () {
                var startBtn = document.getElementById('mm-start-btn');
                if (startBtn) {
                    startBtn.onclick = function () {
                        if (typeof window.UIManager !== 'undefined' &&
                            typeof window.UIManager.startGame === 'function') {
                            window.UIManager.startGame({ levelId: 1 });
                        }
                    };
                }

                var levelBtn = document.getElementById('mm-level-btn');
                if (levelBtn) {
                    levelBtn.onclick = function () {
                        if (typeof window.LevelSelect !== 'undefined' &&
                            typeof window.LevelSelect.refresh === 'function') {
                            window.LevelSelect.refresh();
                        }
                        if (typeof window.UIManager !== 'undefined' &&
                            typeof window.UIManager.showPanel === 'function') {
                            window.UIManager.showPanel('level-select');
                        }
                    };
                }

                var trialBtn = document.getElementById('mm-trial-btn');
                if (trialBtn) {
                    trialBtn.onclick = function () {
                        if (typeof window.UIManager !== 'undefined' &&
                            typeof window.UIManager.showPanel === 'function') {
                            window.UIManager.showPanel('trial-panel');
                        }
                    };
                }

                var leaderboardBtn = document.getElementById('mm-leaderboard-btn');
                if (leaderboardBtn) {
                    leaderboardBtn.onclick = function () {
                        if (typeof window.Leaderboard !== 'undefined' &&
                            typeof window.Leaderboard.refresh === 'function') {
                            window.Leaderboard.refresh();
                        }
                        if (typeof window.UIManager !== 'undefined' &&
                            typeof window.UIManager.showPanel === 'function') {
                            window.UIManager.showPanel('leaderboard-panel');
                        }
                    };
                }

                var replayBtn = document.getElementById('mm-replay-btn');
                if (replayBtn) {
                    replayBtn.onclick = function () {
                        if (typeof window.ReplayPanel !== 'undefined' &&
                            typeof window.ReplayPanel.refresh === 'function') {
                            window.ReplayPanel.refresh();
                        }
                        if (typeof window.UIManager !== 'undefined' &&
                            typeof window.UIManager.showPanel === 'function') {
                            window.UIManager.showPanel('replay-panel');
                        }
                    };
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                setTimeout(init, 0);
            }
        }

        show() {
            if (typeof window.UIManager !== 'undefined' &&
                typeof window.UIManager.showPanel === 'function') {
                window.UIManager.showPanel('main-menu');
            }
        }
    }

    window.MainMenu = new MainMenu();
})();
