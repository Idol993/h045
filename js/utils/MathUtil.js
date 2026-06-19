"use strict";
(function () {
    window.MathUtil = {
        dist: function (x1, y1, x2, y2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        },
        distSq: function (x1, y1, x2, y2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            return dx * dx + dy * dy;
        },
        clamp: function (v, min, max) {
            return Math.max(min, Math.min(max, v));
        },
        lerp: function (a, b, t) {
            return a + (b - a) * t;
        },
        randInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        randFloat: function (min, max) {
            return Math.random() * (max - min) + min;
        },
        circleCollide: function (x1, y1, r1, x2, y2, r2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            var r = r1 + r2;
            return dx * dx + dy * dy < r * r;
        },
        pointInRect: function (px, py, rx, ry, rw, rh) {
            return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
        }
    };
})();
