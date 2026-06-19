"use strict";
(function () {
    class ObjectPool {
        constructor(factoryFn, resetFn, maxSize) {
            this.factoryFn = factoryFn;
            this.resetFn = resetFn;
            this.maxSize = maxSize || 200;
            this.pool = [];
        }

        acquire() {
            var args = Array.prototype.slice.call(arguments);
            var obj;
            if (this.pool.length > 0) {
                obj = this.pool.pop();
            } else {
                obj = this.factoryFn.apply(null, args);
            }
            obj._pooled = true;
            obj._active = true;
            if (this.resetFn) {
                this.resetFn.apply(null, [obj].concat(args));
            }
            return obj;
        }

        release(obj) {
            if (!obj) return;
            if (!obj._pooled) return;
            obj._active = false;
            if (this.pool.length < this.maxSize) {
                this.pool.push(obj);
            }
        }

        size() {
            return this.pool.length;
        }
    }

    window.ObjectPool = ObjectPool;
})();
