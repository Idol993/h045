"use strict";
(function () {
    var COLS = 25;
    var ROWS = 16;
    var TILE = 32;

    function createEmptyMap() {
        var map = [];
        for (var r = 0; r < ROWS; r++) {
            map[r] = [];
            for (var c = 0; c < COLS; c++) {
                map[r][c] = 1;
            }
        }
        return map;
    }

    function setPath(map, pathCells) {
        for (var i = 0; i < pathCells.length; i++) {
            var cell = pathCells[i];
            map[cell[0]][cell[1]] = 0;
        }
    }

    function setTowerSlots(map, towerCells) {
        for (var i = 0; i < towerCells.length; i++) {
            var cell = towerCells[i];
            if (map[cell[0]][cell[1]] === 1) {
                map[cell[0]][cell[1]] = 2;
            }
        }
    }

    function generateSPath1() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 8; c++) path.push([8, c]);
        for (var r = 7; r >= 4; r--) path.push([r, 8]);
        for (var c2 = 9; c2 <= 16; c2++) path.push([4, c2]);
        for (var r2 = 5; r2 <= 8; r2++) path.push([r2, 16]);
        for (var c3 = 17; c3 <= 24; c3++) path.push([8, c3]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 2], [9, 2], [6, 5], [10, 5],
            [3, 6], [3, 10], [3, 14], [5, 10], [5, 14],
            [7, 12], [9, 12], [7, 18], [9, 18],
            [6, 20], [10, 20], [7, 22], [9, 22]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateSPath2() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 6; c++) path.push([8, c]);
        for (var r = 9; r <= 12; r++) path.push([r, 6]);
        for (var c2 = 7; c2 <= 12; c2++) path.push([12, c2]);
        for (var r2 = 11; r2 >= 4; r2--) path.push([r2, 12]);
        for (var c3 = 13; c3 <= 18; c3++) path.push([4, c3]);
        for (var r3 = 5; r3 <= 8; r3++) path.push([r3, 18]);
        for (var c4 = 19; c4 <= 24; c4++) path.push([8, c4]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 2], [9, 2], [7, 4], [10, 4],
            [11, 5], [13, 7], [13, 10], [10, 8],
            [5, 8], [3, 10], [3, 14], [3, 16],
            [5, 14], [5, 16], [7, 17], [9, 17],
            [7, 20], [10, 20], [7, 22], [10, 22]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateZPath() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 5; c++) path.push([8, c]);
        for (var r = 7; r >= 3; r--) path.push([r, 5]);
        for (var c2 = 6; c2 <= 12; c2++) path.push([3, c2]);
        for (var r2 = 4; r2 <= 13; r2++) path.push([r2, 12]);
        for (var c3 = 13; c3 <= 19; c3++) path.push([13, c3]);
        for (var r3 = 12; r3 >= 8; r3--) path.push([r3, 19]);
        for (var c4 = 20; c4 <= 24; c4++) path.push([8, c4]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 2], [9, 2], [6, 3], [10, 3],
            [4, 4], [2, 7], [2, 10], [4, 8],
            [6, 11], [10, 11], [12, 10], [14, 11],
            [14, 14], [14, 17], [12, 15], [12, 18],
            [10, 20], [7, 20], [7, 22], [10, 22]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateLPath() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 10; c++) path.push([8, c]);
        for (var r = 7; r >= 2; r--) path.push([r, 10]);
        for (var c2 = 11; c2 <= 20; c2++) path.push([2, c2]);
        for (var r2 = 3; r2 <= 8; r2++) path.push([r2, 20]);
        for (var c3 = 21; c3 <= 24; c3++) path.push([8, c3]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 3], [9, 3], [7, 6], [9, 6],
            [6, 8], [10, 8], [5, 9], [1, 12],
            [3, 12], [1, 16], [3, 16], [1, 19],
            [3, 19], [4, 18], [6, 18], [7, 19],
            [9, 19], [7, 22], [9, 22]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateMazePath1() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 4; c++) path.push([8, c]);
        for (var r = 7; r >= 2; r--) path.push([r, 4]);
        for (var c2 = 5; c2 <= 9; c2++) path.push([2, c2]);
        for (var r2 = 3; r2 <= 10; r2++) path.push([r2, 9]);
        for (var c3 = 10; c3 <= 14; c3++) path.push([10, c3]);
        for (var r3 = 9; r3 >= 5; r3--) path.push([r3, 14]);
        for (var c4 = 15; c4 <= 20; c4++) path.push([5, c4]);
        for (var r4 = 6; r4 <= 8; r4++) path.push([r4, 20]);
        for (var c5 = 21; c5 <= 24; c5++) path.push([8, c5]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 2], [9, 2], [6, 3], [10, 3],
            [3, 3], [1, 6], [1, 8], [3, 6],
            [3, 8], [5, 8], [8, 8], [11, 10],
            [11, 12], [9, 12], [7, 12], [6, 13],
            [4, 13], [4, 16], [4, 18], [6, 16],
            [6, 18], [7, 19], [9, 19], [7, 22],
            [9, 22]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateMazePath2() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 3; c++) path.push([8, c]);
        for (var r = 9; r <= 13; r++) path.push([r, 3]);
        for (var c2 = 4; c2 <= 8; c2++) path.push([13, c2]);
        for (var r2 = 12; r2 >= 6; r2--) path.push([r2, 8]);
        for (var c3 = 9; c3 <= 13; c3++) path.push([6, c3]);
        for (var r3 = 7; r3 <= 11; r3++) path.push([r3, 13]);
        for (var c4 = 14; c4 <= 18; c4++) path.push([11, c4]);
        for (var r4 = 10; r4 >= 3; r4--) path.push([r4, 18]);
        if (path[path.length - 1][0] !== 3) {
            for (var r5 = path[path.length - 1][0] - 1; r5 >= 3; r5--) path.push([r5, 18]);
        }
        for (var c5 = 19; c5 <= 22; c5++) path.push([3, c5]);
        for (var r6 = 4; r6 <= 8; r6++) path.push([r6, 22]);
        path.push([8, 23]);
        path.push([8, 24]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 2], [9, 2], [10, 2], [7, 4],
            [12, 5], [14, 5], [14, 7], [12, 7],
            [11, 7], [9, 7], [7, 7], [5, 7],
            [5, 10], [5, 12], [7, 10], [7, 12],
            [8, 12], [10, 12], [12, 12], [12, 15],
            [12, 17], [10, 15], [10, 17], [8, 17],
            [5, 17], [2, 20], [2, 21], [4, 20],
            [4, 21], [5, 21], [7, 21], [9, 21],
            [7, 23], [9, 23]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateComplexPath1() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 3; c++) path.push([8, c]);
        for (var r = 7; r >= 5; r--) path.push([r, 3]);
        for (var c2 = 4; c2 <= 7; c2++) path.push([5, c2]);
        for (var r2 = 6; r2 <= 11; r2++) path.push([r2, 7]);
        for (var c3 = 8; c3 <= 11; c3++) path.push([11, c3]);
        for (var r3 = 10; r3 >= 2; r3--) path.push([r3, 11]);
        for (var c4 = 12; c4 <= 16; c4++) path.push([2, c4]);
        for (var r4 = 3; r4 <= 9; r4++) path.push([r4, 16]);
        for (var c5 = 17; c5 <= 20; c5++) path.push([9, c5]);
        for (var r5 = 8; r5 >= 8; r5--) path.push([r5, 20]);
        for (var c6 = 21; c6 <= 24; c6++) path.push([8, c6]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 2], [9, 2], [6, 2], [10, 2],
            [4, 4], [6, 4], [4, 6], [6, 6],
            [7, 6], [9, 6], [8, 8], [10, 8],
            [12, 9], [12, 11], [10, 10], [8, 10],
            [6, 10], [4, 10], [3, 10], [1, 13],
            [1, 15], [3, 13], [3, 15], [4, 15],
            [6, 15], [8, 15], [8, 17], [8, 19],
            [10, 17], [10, 19], [7, 20], [9, 20],
            [7, 22], [9, 22]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateComplexPath2() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 2; c++) path.push([8, c]);
        for (var r = 7; r >= 1; r--) path.push([r, 2]);
        for (var c2 = 3; c2 <= 6; c2++) path.push([1, c2]);
        for (var r2 = 2; r2 <= 8; r2++) path.push([r2, 6]);
        for (var c3 = 7; c3 <= 10; c3++) path.push([8, c3]);
        for (var r3 = 7; r3 >= 4; r3--) path.push([r3, 10]);
        for (var c4 = 11; c4 <= 15; c4++) path.push([4, c4]);
        for (var r4 = 5; r4 <= 13; r4++) path.push([r4, 15]);
        for (var c5 = 16; c5 <= 19; c5++) path.push([13, c5]);
        for (var r5 = 12; r5 >= 8; r5--) path.push([r5, 19]);
        for (var c6 = 20; c6 <= 24; c6++) path.push([8, c6]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 1], [9, 1], [6, 1], [10, 1],
            [2, 1], [0, 4], [2, 4], [0, 5],
            [2, 5], [3, 5], [5, 5], [7, 5],
            [9, 7], [7, 7], [9, 8], [7, 9],
            [9, 9], [5, 9], [3, 9], [3, 12],
            [3, 14], [5, 12], [5, 14], [6, 14],
            [8, 14], [10, 14], [12, 14], [12, 16],
            [12, 18], [14, 16], [14, 18], [10, 18],
            [10, 20], [7, 20], [7, 22], [9, 22]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateBossPath1() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 3; c++) path.push([8, c]);
        for (var r = 7; r >= 2; r--) path.push([r, 3]);
        for (var c2 = 4; c2 <= 8; c2++) path.push([2, c2]);
        for (var r2 = 3; r2 <= 8; r2++) path.push([r2, 8]);
        for (var c3 = 9; c3 <= 12; c3++) path.push([8, c3]);
        for (var r3 = 7; r3 >= 4; r3--) path.push([r3, 12]);
        for (var c4 = 13; c4 <= 17; c4++) path.push([4, c4]);
        for (var r4 = 5; r4 <= 12; r4++) path.push([r4, 17]);
        for (var c5 = 18; c5 <= 21; c5++) path.push([12, c5]);
        for (var r5 = 11; r5 >= 8; r5--) path.push([r5, 21]);
        for (var c6 = 22; c6 <= 24; c6++) path.push([8, c6]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 1], [9, 1], [7, 2], [9, 2],
            [6, 2], [10, 2], [3, 2], [1, 5],
            [1, 7], [3, 5], [3, 7], [4, 7],
            [6, 7], [9, 7], [9, 9], [7, 9],
            [9, 10], [7, 10], [9, 11], [6, 11],
            [5, 11], [3, 11], [3, 14], [3, 16],
            [5, 14], [5, 16], [6, 16], [8, 16],
            [10, 16], [11, 16], [13, 17], [13, 19],
            [11, 18], [11, 20], [9, 20], [7, 20],
            [9, 22], [7, 22], [9, 23], [7, 23]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function generateFinalBossPath() {
        var map = createEmptyMap();
        var path = [];
        for (var c = 0; c <= 2; c++) path.push([8, c]);
        for (var r = 7; r >= 1; r--) path.push([r, 2]);
        for (var c2 = 3; c2 <= 5; c2++) path.push([1, c2]);
        for (var r2 = 2; r2 <= 6; r2++) path.push([r2, 5]);
        for (var c3 = 6; c3 <= 9; c3++) path.push([6, c3]);
        for (var r3 = 5; r3 >= 2; r3--) path.push([r3, 9]);
        for (var c4 = 10; c4 <= 14; c4++) path.push([2, c4]);
        for (var r4 = 3; r4 <= 10; r4++) path.push([r4, 14]);
        for (var c5 = 15; c5 <= 18; c5++) path.push([10, c5]);
        for (var r5 = 9; r5 >= 5; r5--) path.push([r5, 18]);
        for (var c6 = 19; c6 <= 21; c6++) path.push([5, c6]);
        for (var r6 = 6; r6 <= 13; r6++) path.push([r6, 21]);
        for (var c7 = 22; c7 <= 23; c7++) path.push([13, c7]);
        for (var r7 = 12; r7 >= 8; r7--) path.push([r7, 23]);
        path.push([8, 24]);
        setPath(map, path);
        map[8][0] = 3;
        map[8][24] = 4;
        var towers = [
            [7, 1], [9, 1], [6, 1], [10, 1],
            [5, 1], [11, 1], [2, 1], [0, 3],
            [2, 3], [0, 4], [2, 4], [3, 4],
            [5, 4], [7, 4], [5, 6], [7, 6],
            [5, 8], [7, 8], [4, 8], [3, 8],
            [1, 7], [1, 11], [1, 13], [3, 11],
            [3, 13], [4, 13], [6, 13], [8, 13],
            [11, 13], [11, 15], [11, 17], [9, 15],
            [9, 17], [7, 17], [6, 17], [4, 17],
            [4, 19], [4, 20], [6, 19], [6, 20],
            [7, 20], [8, 20], [10, 20], [12, 20],
            [14, 21], [14, 22], [12, 22], [10, 22],
            [9, 22], [7, 22], [9, 23], [7, 23]
        ];
        setTowerSlots(map, towers);
        return map;
    }

    function createWaves(levelIdx, hasBoss) {
        var baseCount = 4 + levelIdx * 2;
        var numWaves = 6 + Math.min(levelIdx, 9);
        var waves = [];
        var types = ['normal', 'fast', 'tank', 'elite'];

        for (var w = 0; w < numWaves; w++) {
            var enemies = [];
            var waveCount = baseCount + w * 2;

            if (w < 2) {
                enemies.push({ type: 'normal', count: waveCount, interval: 0.8 });
            } else if (w < 4) {
                enemies.push({ type: 'normal', count: Math.max(1, Math.floor(waveCount * 0.6)), interval: 0.7 });
                enemies.push({ type: 'fast', count: Math.max(1, Math.floor(waveCount * 0.4)), interval: 0.5 });
            } else if (w < 6) {
                enemies.push({ type: 'normal', count: Math.max(1, Math.floor(waveCount * 0.4)), interval: 0.7 });
                enemies.push({ type: 'fast', count: Math.max(1, Math.floor(waveCount * 0.4)), interval: 0.5 });
                enemies.push({ type: 'tank', count: Math.max(1, Math.floor(waveCount * 0.15)), interval: 1.2 });
            } else if (w < 8) {
                enemies.push({ type: 'fast', count: Math.max(1, Math.floor(waveCount * 0.35)), interval: 0.5 });
                enemies.push({ type: 'tank', count: Math.max(1, Math.floor(waveCount * 0.25)), interval: 1.2 });
                enemies.push({ type: 'elite', count: Math.max(1, Math.floor(waveCount * 0.2)), interval: 1.0 });
            } else {
                enemies.push({ type: 'normal', count: Math.max(1, Math.floor(waveCount * 0.3)), interval: 0.6 });
                enemies.push({ type: 'fast', count: Math.max(1, Math.floor(waveCount * 0.3)), interval: 0.4 });
                enemies.push({ type: 'tank', count: Math.max(1, Math.floor(waveCount * 0.2)), interval: 1.0 });
                enemies.push({ type: 'elite', count: Math.max(1, Math.floor(waveCount * 0.2)), interval: 0.9 });
            }

            waves.push({
                enemies: enemies,
                delay: 8 - Math.min(levelIdx * 0.4, 4)
            });
        }

        if (hasBoss) {
            waves.push({
                enemies: [
                    { type: 'elite', count: 4 + levelIdx, interval: 1.0 },
                    { type: 'boss', count: 1, interval: 0 }
                ],
                delay: 12
            });
        }

        return waves;
    }

    var maps = [
        generateSPath1(),
        generateSPath2(),
        generateZPath(),
        generateLPath(),
        generateBossPath1(),
        generateMazePath1(),
        generateMazePath2(),
        generateComplexPath1(),
        generateComplexPath2(),
        generateFinalBossPath()
    ];

    var levelNames = [
        '第一关·新手村',
        '第二关·林间小径',
        '第三关·迂回战场',
        '第四关·转折之地',
        '第五关·BOSS来袭',
        '第六关·迷雾森林',
        '第七关·曲折迷宫',
        '第八关·多重防线',
        '第九关·终极试炼',
        '第十关·最终决战'
    ];

    var levels = [];
    for (var i = 0; i < 10; i++) {
        levels.push({
            id: i + 1,
            name: levelNames[i],
            startGold: 200 + i * 30,
            startHp: 20 - Math.floor(i / 3),
            map: maps[i],
            waves: createWaves(i, i === 4 || i === 9)
        });
    }

    window.LEVEL_CONFIG = {
        COLS: COLS,
        ROWS: ROWS,
        TILE: TILE,
        levels: levels
    };
})();
