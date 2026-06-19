"use strict";
(function () {
    function PerfMonitor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.frameTime = 0;
        this.pathTimes = [];
        this.avgPathTime = 0;
        this._frameStart = 0;
    }

    PerfMonitor.prototype.beginFrame = function () {
        this._frameStart = performance.now();
    };

    PerfMonitor.prototype.endFrame = function () {
        var now = performance.now();
        this.frameTime = now - this._frameStart;
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }
    };

    PerfMonitor.prototype.recordPathTime = function (ms) {
        this.pathTimes.push(ms);
        if (this.pathTimes.length > 60) {
            this.pathTimes.shift();
        }
        var sum = 0;
        for (var i = 0; i < this.pathTimes.length; i++) {
            sum += this.pathTimes[i];
        }
        this.avgPathTime = sum / this.pathTimes.length;
    };

    PerfMonitor.prototype.getStats = function () {
        return {
            fps: this.fps,
            avgPathTime: this.avgPathTime,
            frameTime: this.frameTime
        };
    };

    window.PerfMonitor = PerfMonitor;
})();
