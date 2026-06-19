"use strict";
(function () {
    class ReplayPanel {
        constructor() {
            var self = this;
            var init = function () {
                var importBtn = document.getElementById('rp-import-btn');
                if (importBtn) {
                    var fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.json';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);

                    importBtn.onclick = function () {
                        fileInput.value = '';
                        fileInput.click();
                    };

                    fileInput.onchange = async function (e) {
                        var file = e.target.files && e.target.files[0];
                        if (!file) return;
                        if (typeof window.ReplayRecorder === 'undefined') {
                            alert('录像系统未加载');
                            return;
                        }
                        try {
                            var data;
                            if (typeof window.ReplayRecorder.importFromFile === 'function') {
                                data = await window.ReplayRecorder.importFromFile(file);
                            } else {
                                var rec = new window.ReplayRecorder();
                                if (typeof rec.importFromFile === 'function') {
                                    data = await rec.importFromFile(file);
                                } else {
                                    var text = await file.text();
                                    data = JSON.parse(text);
                                }
                            }
                            self.previewReplay(data);
                        } catch (err) {
                            alert('导入失败：' + (err && err.message ? err.message : String(err)));
                        }
                    };
                }

                var backBtn = document.getElementById('rp-back-btn');
                if (backBtn) {
                    backBtn.onclick = function () {
                        if (typeof window.UIManager !== 'undefined' &&
                            typeof window.UIManager.showPanel === 'function') {
                            window.UIManager.showPanel('main-menu');
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

        refresh() {
            var info = document.getElementById('rp-info');
            if (!info) return;
            info.innerHTML =
                '<h3>📼 录像系统使用说明</h3>' +
                '<p>1. 通关后，在结算面板点击「💾 保存录像」按钮可导出 JSON 格式录像文件</p>' +
                '<p>2. 点击「📂 导入录像」按钮，选择之前导出的 JSON 文件</p>' +
                '<p>3. 导入后可查看战斗摘要数据，并点击观战按钮播放</p>' +
                '<p style="opacity:.6;font-size:12px">提示：录像文件可分享给好友，实现跨设备互相观战</p>';
        }

        previewReplay(data) {
            var info = document.getElementById('rp-info');
            if (!info) return;
            if (!data || typeof data !== 'object') {
                info.innerHTML = '<p style="color:#f44336">录像数据无效</p>';
                return;
            }

            var isWin = data.result === 'win' || data.victory === true;
            var title = isWin ? '🏆 胜利录像' : '💀 失败录像';
            var levelId = data.levelId || (data.isTrial ? '试炼模式' : '未知');
            var dur = data.duration || data.elapsed || 0;
            var m = Math.floor(dur / 60);
            var s = Math.floor(dur % 60);
            var durStr = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

            var stats = data.stats || {};
            var startHp = data.startHp != null ? data.startHp : (stats.startHp != null ? stats.startHp : '?');
            var endHp = data.endHp != null ? data.endHp : (stats.endHp != null ? stats.endHp : '?');
            var finalGold = data.finalGold != null ? data.finalGold : (stats.finalGold != null ? stats.finalGold : '?');
            var eventCount = data.frames ? data.frames.length : (data.events ? data.events.length : (stats.eventCount || 0));

            var hpDiff = (typeof endHp === 'number' && typeof startHp === 'number') ? (endHp - startHp) : null;
            var hpDiffStr = hpDiff != null ? (hpDiff >= 0 ? '+' : '') + hpDiff : '';

            info.innerHTML =
                '<h3>' + title + '</h3>' +
                '<p><b>关卡:</b> ' + levelId + '</p>' +
                '<p><b>用时:</b> ' + durStr + '</p>' +
                '<p><b>血量变化:</b> ' + startHp + ' → ' + endHp + ' <span style="opacity:.6">(' + (hpDiffStr || '--') + ')</span></p>' +
                '<p><b>最终金币:</b> <span class="gold-color">$' + finalGold + '</span></p>' +
                '<p><b>事件数:</b> ' + eventCount + '</p>' +
                '<div style="margin-top:16px"><button class="pixel-btn primary-btn" id="rp-watch-btn">▶ 开始观战</button></div>';

            var watchBtn = document.getElementById('rp-watch-btn');
            if (watchBtn) {
                watchBtn.onclick = function () {
                    if (typeof window.UIManager !== 'undefined' &&
                        typeof window.UIManager.showPanel === 'function') {
                        window.UIManager.showPanel('replay-screen');
                    }
                    if (typeof window.ReplayPlayer !== 'undefined') {
                        if (!window.ReplayPlayer.canvas) {
                            window.ReplayPlayer.init();
                        }
                        window.ReplayPlayer.loadReplay(data);
                        window.ReplayPlayer.play();
                        window.ReplayPlayer.onExit(function () {
                            if (typeof window.UIManager !== 'undefined' &&
                                typeof window.UIManager.showPanel === 'function') {
                                window.UIManager.showPanel('replay-panel');
                            }
                        });
                    }
                };
            }
        }
    }

    window.ReplayPanel = new ReplayPanel();
})();
