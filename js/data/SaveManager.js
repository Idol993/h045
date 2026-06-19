"use strict";
(function () {
    class SaveManager {
        constructor() {
            this.KEY = 'PixelTD_Save_v1';
            this.data = this._load();
        }

        _load() {
            try {
                var s = localStorage.getItem(this.KEY);
                if (s) return JSON.parse(s);
            } catch (e) { }
            return {
                unlockedLevel: 1,
                levelStars: {},
                settings: { sfx: 1, music: 1 }
            };
        }

        _save() {
            try {
                localStorage.setItem(this.KEY, JSON.stringify(this.data));
            } catch (e) { }
        }

        getUnlockedLevel() {
            return Math.max(1, this.data.unlockedLevel || 1);
        }

        unlockLevel(n) {
            if (n > this.data.unlockedLevel) {
                this.data.unlockedLevel = n;
                this._save();
            }
        }

        getLevelStars() {
            return this.data.levelStars || {};
        }

        setLevelStars(levelId, stars) {
            var old = this.data.levelStars[levelId] || 0;
            if (stars > old) {
                this.data.levelStars[levelId] = stars;
                this._save();
            }
        }

        calcStars(endHp, startHp) {
            var ratio = endHp / Math.max(1, startHp);
            if (ratio >= 0.8) return 3;
            if (ratio >= 0.5) return 2;
            if (ratio > 0) return 1;
            return 0;
        }
    }

    window.SaveManager = new SaveManager();
})();
