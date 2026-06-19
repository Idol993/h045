"use strict";
(function () {
    window.SKILL_CONFIG = {
        freeze:  { key: 'Q', name: '冰冻减速', cd: 30, duration: 5, slow: 0.7, color: '#4fc3f7', desc: '全屏敌人减速70%，持续5秒' },
        rocket:  { key: 'E', name: '火箭轰击', cd: 60, damage: 300, radius: 150, color: '#ff5722', desc: '鼠标位置半径150px造成300伤害' },
        heal:    { key: 'R', name: '治疗光环', cd: 45, hp: 10, goldBonus: 1.5, goldDur: 45, color: '#81c784', desc: '恢复10点生命值，冷却期间击杀多50%金币' }
    };
})();
