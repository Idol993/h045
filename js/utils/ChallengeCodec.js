"use strict";
(function () {
    window.ChallengeCodec = {
        encode: function (config) {
            var json = JSON.stringify(config);
            var encoded = encodeURIComponent(json);
            var base64 = btoa(encoded);
            return base64.replace(/=+$/, '');
        },
        decode: function (str) {
            try {
                var pad = 4 - (str.length % 4);
                if (pad < 4) {
                    str += '='.repeat(pad);
                }
                var decoded = atob(str);
                var json = decodeURIComponent(decoded);
                return JSON.parse(json);
            } catch (e) {
                return null;
            }
        },
        generateSeed: function () {
            return Math.floor(Math.random() * 90000) + 10000;
        }
    };
})();
