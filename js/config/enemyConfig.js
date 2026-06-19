"use strict";
(function () {
    window.ENEMY_CONFIG = {
        normal: { name: '普通', hp: 60, speed: 1.5, gold: 10, color: '#4caf50', size: 12 },
        fast:   { name: '快速', hp: 40, speed: 2.8, gold: 15, color: '#ffeb3b', size: 10 },
        tank:   { name: '坦克', hp: 220, speed: 0.8, gold: 35, color: '#1976d2', size: 16 },
        elite:  { name: '精英', hp: 150, speed: 1.8, gold: 30, color: '#9c27b0', size: 13 },
        boss:   { name: 'BOSS', hp: 1500, speed: 0.6, gold: 300, color: '#f44336', size: 24 }
    };
    window.ENEMY_GROWTH = 0.18;
    window.ENEMY_TYPES = ['normal', 'fast', 'tank', 'elite'];
})();
