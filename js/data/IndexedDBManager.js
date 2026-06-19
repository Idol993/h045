"use strict";
(function () {
    class IndexedDBManager {
        constructor() {
            this.DB_NAME = 'PixelTD_DB';
            this.DB_VERSION = 1;
            this.STORE_NAME = 'leaderboard';
            this.db = null;
            this._initPromise = this.init();
        }

        init() {
            var self = this;
            return new Promise(function (resolve, reject) {
                var req = indexedDB.open(self.DB_NAME, self.DB_VERSION);
                req.onupgradeneeded = function (e) {
                    var db = e.target.result;
                    if (!db.objectStoreNames.contains(self.STORE_NAME)) {
                        var store = db.createObjectStore(self.STORE_NAME, { keyPath: 'id', autoIncrement: true });
                        store.createIndex('levelId', 'levelId', { unique: false });
                        store.createIndex('endHp', 'endHp', { unique: false });
                        store.createIndex('duration', 'duration', { unique: false });
                        store.createIndex('date', 'date', { unique: false });
                    }
                };
                req.onsuccess = function (e) {
                    self.db = e.target.result;
                    resolve(self.db);
                };
                req.onerror = function (e) {
                    reject(e.target.error);
                };
            });
        }

        async addScore(record) {
            await this._initPromise;
            var self = this;
            return new Promise(function (resolve, reject) {
                var tx = self.db.transaction(self.STORE_NAME, 'readwrite');
                var store = tx.objectStore(self.STORE_NAME);
                var req = store.add(record);
                req.onsuccess = function () {
                    resolve(req.result);
                };
                req.onerror = function () {
                    reject(req.error);
                };
            });
        }

        async getTopScores(n) {
            if (n == null) n = 20;
            await this._initPromise;
            var self = this;
            return new Promise(function (resolve, reject) {
                var tx = self.db.transaction(self.STORE_NAME, 'readonly');
                var store = tx.objectStore(self.STORE_NAME);
                var all = [];
                store.openCursor().onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        all.push(cursor.value);
                        cursor.continue();
                    } else {
                        all.sort(function (a, b) {
                            if (b.endHp !== a.endHp) return b.endHp - a.endHp;
                            return a.duration - b.duration;
                        });
                        resolve(all.slice(0, n));
                    }
                };
                tx.onerror = function () {
                    reject(tx.error);
                };
            });
        }

        async clearScores() {
            await this._initPromise;
            var self = this;
            return new Promise(function (resolve, reject) {
                var tx = self.db.transaction(self.STORE_NAME, 'readwrite');
                var req = tx.objectStore(self.STORE_NAME).clear();
                req.onsuccess = function () {
                    resolve();
                };
                req.onerror = function () {
                    reject(req.error);
                };
            });
        }

        async trySaveScore(record) {
            try {
                return await this.addScore(record);
            } catch (e) {
                console.warn('保存排行榜失败:', e);
                return null;
            }
        }
    }

    window.IndexedDBManager = new IndexedDBManager();
})();
