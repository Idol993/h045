"use strict";
(function () {
    class EventBus {
        constructor() {
            this.listeners = {};
        }

        on(event, cb) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(cb);
        }

        off(event, cb) {
            if (!this.listeners[event]) return;
            this.listeners[event] = this.listeners[event].filter(function (fn) {
                return fn !== cb;
            });
        }

        emit(event) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (!this.listeners[event]) return;
            var cbs = this.listeners[event].slice();
            for (var i = 0; i < cbs.length; i++) {
                try {
                    cbs[i].apply(null, args);
                } catch (e) {
                    console.error('[EventBus] callback error for event "' + event + '":', e);
                }
            }
        }
    }

    window.EventBus = new EventBus();
})();
