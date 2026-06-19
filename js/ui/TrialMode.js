"use strict";
(function () {
    class TrialMode {
        constructor() {
            var self = this;
            var init = function () {
                self._bindSliders();
                self._bindButtons();
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                setTimeout(init, 0);
            }
        }

        _bindSliders() {
            var self = this;
            var sliderPairs = [
                { slider: 'trial-wave-count', val: 'trial-wave-val', isRatio: false },
                { slider: 'trial-count-slider', val: 'trial-count-val', isRatio: false }
            ];
            var ratioPairs = [
                { slider: 't-ratio-normal', val: 't-ratio-normal-val' },
                { slider: 't-ratio-fast', val: 't-ratio-fast-val' },
                { slider: 't-ratio-tank', val: 't-ratio-tank-val' },
                { slider: 't-ratio-elite', val: 't-ratio-elite-val' }
            ];

            sliderPairs.forEach(function (p) {
                var sl = document.getElementById(p.slider);
                var vl = document.getElementById(p.val);
                if (sl && vl) {
                    sl.addEventListener('input', function () {
                        vl.textContent = sl.value;
                    });
                }
            });

            ratioPairs.forEach(function (p) {
                var sl = document.getElementById(p.slider);
                if (sl) {
                    sl.addEventListener('input', function () {
                        self._updateRatioDisplay(ratioPairs);
                    });
                }
            });

            self._updateRatioDisplay(ratioPairs);
        }

        _updateRatioDisplay(ratioPairs) {
            var total = 0;
            var vals = [];
            for (var i = 0; i < ratioPairs.length; i++) {
                var sl = document.getElementById(ratioPairs[i].slider);
                var v = sl ? parseInt(sl.value, 10) || 0 : 0;
                vals.push(v);
                total += v;
            }
            for (var j = 0; j < ratioPairs.length; j++) {
                var vl = document.getElementById(ratioPairs[j].val);
                if (vl) {
                    var pct = total > 0 ? Math.round((vals[j] / total) * 100) : 0;
                    vl.textContent = pct + '%';
                }
            }
        }

        _bindButtons() {
            var self = this;

            var generateBtn = document.getElementById('trial-generate-btn');
            if (generateBtn) {
                generateBtn.onclick = function () {
                    var cfg = self.collectConfig();
                    var out = document.getElementById('trial-code-output');
                    if (typeof window.ChallengeCodec !== 'undefined' &&
                        typeof window.ChallengeCodec.encode === 'function') {
                        var code = window.ChallengeCodec.encode(cfg);
                        if (out) {
                            out.value = code;
                            out.focus();
                            out.select();
                        }
                    } else {
                        if (out) {
                            out.value = JSON.stringify(cfg);
                            out.focus();
                            out.select();
                        }
                    }
                };
            }

            var copyBtn = document.getElementById('trial-copy-btn');
            if (copyBtn) {
                copyBtn.onclick = function () {
                    var out = document.getElementById('trial-code-output');
                    if (out && out.value && navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(out.value).catch(function () {});
                    }
                };
            }

            var loadBtn = document.getElementById('trial-load-btn');
            if (loadBtn) {
                loadBtn.onclick = function () {
                    var input = document.getElementById('trial-code-input');
                    if (!input || !input.value.trim()) return;
                    if (typeof window.ChallengeCodec !== 'undefined' &&
                        typeof window.ChallengeCodec.decode === 'function') {
                        try {
                            var cfg = window.ChallengeCodec.decode(input.value.trim());
                            if (cfg) self.applyConfig(cfg);
                        } catch (e) {}
                    }
                };
            }

            var backBtn = document.getElementById('trial-back-btn');
            if (backBtn) {
                backBtn.onclick = function () {
                    if (typeof window.UIManager !== 'undefined' &&
                        typeof window.UIManager.showPanel === 'function') {
                        window.UIManager.showPanel('main-menu');
                    }
                };
            }

            var startBtn = document.getElementById('trial-start-btn');
            if (startBtn) {
                startBtn.onclick = function () {
                    var cfg = null;
                    var code = '';
                    var input = document.getElementById('trial-code-input');
                    if (input && input.value.trim() &&
                        typeof window.ChallengeCodec !== 'undefined' &&
                        typeof window.ChallengeCodec.decode === 'function') {
                        try {
                            cfg = window.ChallengeCodec.decode(input.value.trim());
                            code = input.value.trim();
                        } catch (e) {
                            cfg = null;
                        }
                    }
                    if (!cfg) {
                        cfg = self.collectConfig();
                        if (typeof window.ChallengeCodec !== 'undefined' &&
                            typeof window.ChallengeCodec.encode === 'function') {
                            code = window.ChallengeCodec.encode(cfg);
                        }
                    }
                    if (typeof window.UIManager !== 'undefined' &&
                        typeof window.UIManager.startGame === 'function') {
                        window.UIManager.startGame({
                            isTrial: true,
                            trialConfig: cfg,
                            challengeCode: code
                        });
                    }
                };
            }
        }

        collectConfig() {
            var wSlider = document.getElementById('trial-wave-count');
            var cSlider = document.getElementById('trial-count-slider');
            var nSlider = document.getElementById('t-ratio-normal');
            var fSlider = document.getElementById('t-ratio-fast');
            var tSlider = document.getElementById('t-ratio-tank');
            var eSlider = document.getElementById('t-ratio-elite');

            var w = wSlider ? parseInt(wSlider.value, 10) || 10 : 10;
            var count = cSlider ? parseInt(cSlider.value, 10) || 10 : 10;
            var n = nSlider ? parseInt(nSlider.value, 10) || 0 : 0;
            var f = fSlider ? parseInt(fSlider.value, 10) || 0 : 0;
            var t = tSlider ? parseInt(tSlider.value, 10) || 0 : 0;
            var e = eSlider ? parseInt(eSlider.value, 10) || 0 : 0;

            if (n === 0 && f === 0 && t === 0 && e === 0) {
                n = 1;
            }
            var sum = n + f + t + e;
            var nNorm = sum > 0 ? n / sum : 0.25;
            var fNorm = sum > 0 ? f / sum : 0.25;
            var tNorm = sum > 0 ? t / sum : 0.25;
            var eNorm = sum > 0 ? e / sum : 0.25;

            var waves = [];
            for (var i = 0; i < w; i++) {
                waves.push({
                    count: count,
                    ratio: {
                        normal: nNorm,
                        fast: fNorm,
                        tank: tNorm,
                        elite: eNorm
                    }
                });
            }

            var seed = Date.now() & 0x7fffffff;
            if (typeof window.ChallengeCodec !== 'undefined' &&
                typeof window.ChallengeCodec.generateSeed === 'function') {
                seed = window.ChallengeCodec.generateSeed();
            }

            return {
                w: w,
                seed: seed,
                waves: waves
            };
        }

        applyConfig(cfg) {
            if (!cfg) return;
            var w = cfg.w;
            var firstWave = cfg.waves && cfg.waves.length > 0 ? cfg.waves[0] : null;
            if (w == null && firstWave) w = cfg.waves.length;
            if (w == null) w = 10;

            var wSlider = document.getElementById('trial-wave-count');
            var wVal = document.getElementById('trial-wave-val');
            if (wSlider) {
                wSlider.value = w;
                if (wVal) wVal.textContent = w;
            }

            if (firstWave && firstWave.count != null) {
                var cSlider = document.getElementById('trial-count-slider');
                var cVal = document.getElementById('trial-count-val');
                if (cSlider) {
                    cSlider.value = firstWave.count;
                    if (cVal) cVal.textContent = firstWave.count;
                }
            }

            if (firstWave && firstWave.ratio) {
                var rn = firstWave.ratio.normal || 0;
                var rf = firstWave.ratio.fast || 0;
                var rt = firstWave.ratio.tank || 0;
                var re = firstWave.ratio.elite || 0;
                var total = rn + rf + rt + re;
                var mul = total > 0 ? 100 / total : 1;

                var nSlider = document.getElementById('t-ratio-normal');
                if (nSlider) nSlider.value = Math.max(0, Math.min(100, Math.round(rn * mul)));
                var fSlider = document.getElementById('t-ratio-fast');
                if (fSlider) fSlider.value = Math.max(0, Math.min(100, Math.round(rf * mul)));
                var tSlider = document.getElementById('t-ratio-tank');
                if (tSlider) tSlider.value = Math.max(0, Math.min(100, Math.round(rt * mul)));
                var eSlider = document.getElementById('t-ratio-elite');
                if (eSlider) eSlider.value = Math.max(0, Math.min(100, Math.round(re * mul)));

                var ratioPairs = [
                    { slider: 't-ratio-normal', val: 't-ratio-normal-val' },
                    { slider: 't-ratio-fast', val: 't-ratio-fast-val' },
                    { slider: 't-ratio-tank', val: 't-ratio-tank-val' },
                    { slider: 't-ratio-elite', val: 't-ratio-elite-val' }
                ];
                this._updateRatioDisplay(ratioPairs);
            }
        }
    }

    window.TrialMode = new TrialMode();
})();
