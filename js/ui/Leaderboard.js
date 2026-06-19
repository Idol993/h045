"use strict";
(function () {
    class Leaderboard {
        async refresh() {
            var self = this;
            var tbody = document.getElementById('leaderboard-tbody');
            var backBtn = document.getElementById('lb-back-btn');
            var clearBtn = document.getElementById('lb-clear-btn');
            if (!tbody) return;

            tbody.innerHTML = '<tr><td colspan="5" class="empty-row">加载中...</td></tr>';

            var list = [];
            if (typeof window.IndexedDBManager !== 'undefined' &&
                typeof window.IndexedDBManager.getTopScores === 'function') {
                try {
                    list = await window.IndexedDBManager.getTopScores(20);
                } catch (e) {
                    console.error('[Leaderboard] load error:', e);
                    list = [];
                }
            }

            tbody.innerHTML = '';
            if (!Array.isArray(list) || list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-row">暂无记录，快去挑战吧！</td></tr>';
            } else {
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    var tr = document.createElement('tr');
                    if (i === 0) tr.classList.add('top-1');
                    else if (i === 1) tr.classList.add('top-2');
                    else if (i === 2) tr.classList.add('top-3');

                    var rankCell = document.createElement('td');
                    if (i === 0) rankCell.textContent = '🥇 ' + (i + 1);
                    else if (i === 1) rankCell.textContent = '🥈 ' + (i + 1);
                    else if (i === 2) rankCell.textContent = '🥉 ' + (i + 1);
                    else rankCell.textContent = i + 1;
                    tr.appendChild(rankCell);

                    var levelCell = document.createElement('td');
                    levelCell.textContent = item.isTrial ? '试炼模式' : ('第 ' + (item.levelId || 1) + ' 关');
                    tr.appendChild(levelCell);

                    var hpCell = document.createElement('td');
                    var hp = item.endHp != null ? item.endHp : (item.hp != null ? item.hp : '?');
                    hpCell.textContent = hp + ' ❤️';
                    tr.appendChild(hpCell);

                    var timeCell = document.createElement('td');
                    var dur = item.duration || item.elapsed || 0;
                    var m = Math.floor(dur / 60);
                    var s = Math.floor(dur % 60);
                    timeCell.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
                    tr.appendChild(timeCell);

                    var dateCell = document.createElement('td');
                    try {
                        dateCell.textContent = new Date(item.date || Date.now()).toLocaleString();
                    } catch (e) {
                        dateCell.textContent = '-';
                    }
                    tr.appendChild(dateCell);

                    tbody.appendChild(tr);
                }
            }

            if (backBtn) {
                backBtn.onclick = function () {
                    if (typeof window.UIManager !== 'undefined' &&
                        typeof window.UIManager.showPanel === 'function') {
                        window.UIManager.showPanel('main-menu');
                    }
                };
            }

            if (clearBtn) {
                clearBtn.onclick = async function () {
                    if (confirm('清空记录?')) {
                        if (typeof window.IndexedDBManager !== 'undefined' &&
                            typeof window.IndexedDBManager.clearScores === 'function') {
                            try {
                                await window.IndexedDBManager.clearScores();
                            } catch (e) {
                                console.error('[Leaderboard] clear error:', e);
                            }
                        }
                        self.refresh();
                    }
                };
            }
        }
    }

    window.Leaderboard = new Leaderboard();
})();
