"use strict";
(function () {
    window.TOWER_CONFIG = {
        arrow: {
            name: '箭塔',
            color: '#66bb6a',
            levels: [
                { damage: 15, attackSpeed: 2.0, range: 3.5, cost: 50, pierce: 0, desc: '单体快速攻击' },
                { damage: 28, attackSpeed: 2.5, range: 4.0, cost: 60, pierce: 1, desc: '穿透1目标' },
                { damage: 50, attackSpeed: 3.0, range: 4.5, cost: 90, pierce: 2, desc: '穿透2目标' }
            ]
        },
        cannon: {
            name: '炮塔',
            color: '#ff7043',
            levels: [
                { damage: 45, attackSpeed: 0.8, range: 3.0, cost: 100, splash: 0.8, burn: 0, desc: '范围爆炸' },
                { damage: 85, attackSpeed: 1.0, range: 3.5, cost: 120, splash: 1.2, burn: 0, desc: '爆炸范围+50%' },
                { damage: 160, attackSpeed: 1.2, range: 4.0, cost: 180, splash: 1.2, burn: 8, desc: '燃烧持续伤害' }
            ]
        },
        magic: {
            name: '魔法塔',
            color: '#ab47bc',
            levels: [
                { damage: 25, attackSpeed: 1.5, range: 3.0, cost: 80, slow: 0.3, slowDur: 2, chain: 0, desc: '减速30% 2秒' },
                { damage: 45, attackSpeed: 1.8, range: 3.5, cost: 100, slow: 0.5, slowDur: 3, chain: 0, desc: '减速50% 3秒' },
                { damage: 80, attackSpeed: 2.0, range: 4.0, cost: 150, slow: 0.3, slowDur: 2, chain: 3, desc: '连锁闪电跳3个' }
            ]
        }
    };
})();
