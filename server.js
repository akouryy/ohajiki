var listenPath = '';
var allowedAccesses = ["/client.js", "/monitor", "/monitor.js", "/paper.min.js", "/img/bey01.svg", "/img/stage.svg", "/img/stone.svg", "/monitor.css", "/lib/jquery-easing.js", "/lib/jquery.js", "/lib/paper.js", "/lib/seedrandom.js", "/lib/helper.js"];

var mimeTypes = {
    "html": "text/html; charset=utf-8",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css",
    "svg": "image/svg+xml"
};

var writeFromFile = function (req, res, locate) {
    fs.readFile(__dirname + locate, function (err, data) {
        if (err) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.write('Error loading ' + locate);
            res.end();
            return;
        }

        res.writeHead(200, {
            'Content-Type': mimeTypes[path.extname(locate).split(".")[1]]
        });
        res.write(data);
        res.end();
    });
}

function handler (req, res) {
/*    if (req.headers.host != 'hkp5vftgbw-yngyqdernbcurz.npca.jp:8080') {
        res.writeHead(403, {
            'Content-Type': 'text/plain'
        });
        res.write('Forbidden');
        res.end();
        return ;
    }
*/
    var urlinfo = require('url').parse(req.url, true);

    if (urlinfo.pathname.substring(0, listenPath.length) === listenPath) {
        var path = urlinfo.pathname.substring(listenPath.length);
        if (path === "/") writeFromFile(req, res, "/index.html");
        else if (path === "/monitor") writeFromFile(req, res, "/monitor.html");
        else if (allowedAccesses.indexOf(path) >= 0) writeFromFile(req, res, path);
    }
}

var app = require('http').createServer(handler);
var io = require('socket.io').listen(
    app, 
    {resource: listenPath + '/socket.io'}
);
var fs = require('fs');
var path = require('path');

// masatu keisuu
var renderFPS = 60;
var worldFPS = 30;
var cpuThinkFPS = 3;

var fieldStates = {entry:0, playing:2, result:3};
var currentState = fieldStates.entry;

var stoneList = [[], [], [], []];
var stoneNum = [0, 0, 0, 0];
var stoneMax = 6;

var NPC = -1;
var NPCInterval = [-1, -1, -1, -1];

var connectingNum = 0;
var connectingList = [NPC, NPC, NPC, NPC];
var connectingDict = new Object();

var gameTime = 0;
var cpuMinEmergeTime = 3;
var fieldSize = 7000;
var speed = 0.8;
var repulse = 200;

var latestCpuEmergeFrame = 0;
var frame = 0;
var clients = {};

var timeoutID;

var Stone = function (point, weight, size, coordinate, speed) {
    
    this.point = point;
    this.weight = weight;
    this.size = size;

    this.coordinate = coordinate;
    this.speed = speed;

    this.isDisabled = false;
    //this.acceleration = [0, 0];
}

function createStone(index, point, weight, size, coordinate, speed) {
    if (index < 0 || 3 < index || stoneNum[index] >= stoneMax) return false;

    var stone = new Stone(point, weight, size, coordinate, speed);
    stoneList[index].push(stone);

    io.of('/monitor').emit('addStone', {uid: index , sid: stoneList[index].length-1, x: coordinate[0], y: coordinate[1]});
    
    return true;
};

function rotateSpeed(index, speed) {
    var ret;

    if (index == 0) {
        ret = [-speed[0], -speed[1]];
    } else if (index == 1) {
        ret = [speed[1], -speed[0]];
    } else if (index == 2) {
        ret = [speed[0], speed[1]];
    } else if (index == 3) {
        ret = [-speed[1], speed[0]];
    }

    return ret;
};

function chooseAppearCoordinate (index, appearPos) {
    var ret;

    if (index == 0) {
        ret = [700 - 1400*appearPos, -3500];
    } else if (index == 1) {
        ret = [3500, 700 - 1400*appearPos];
    } else if (index == 2) {
        ret = [-700 + 1400*appearPos, 3500];
    } else if (index == 3) {
        ret = [-3500, -700 + 1400*appearPos];
    }

    return ret;
}


var sendOnConnection = function (socket) {
    var sendOnEstablish = function () {
        var sendOnShot = function (data) {

            if (stoneNum[connectingDict[socket.id]] >= stoneMax || currentState != fieldStates.playing) return ;

            var tan = data.speed[1]/data.speed[0];

            if (0 <= data.appearPos && data.appearPos <= 1 && data.speed[1] < 0 && (tan <= Math.tan(Math.PI*2/3) || Math.tan(Math.PI/3) <= tan)) {
                if (socket.id in connectingDict) {
                    var speed = rotateSpeed(connectingDict[socket.id], data.speed);
                    var coordinate = chooseAppearCoordinate(connectingDict[socket.id], data.appearPos);
    
                    createStone(connectingDict[socket.id], 10.0, 10.0, 87.5, coordinate, speed);
                    
                    stoneNum[connectingDict[socket.id]]++;
                    if (stoneNum[connectingDict[socket.id]] < stoneMax) socket.emit('allowShot');
                } else {
                }
            } else {
                if (stoneNum[connectingDict[socket.id]] < stoneNum) socket.emit('allowShot'); 
            }
        };
    
        var sendOnDisconnection = function () {
            var ind = connectingDict[socket.id];
    
            connectingList[ind] = NPC;
            delete connectingDict[socket.id];
            connectingNum--;

            io.of('/monitor').emit('unsetPlayer', ind);
        };
    
        var onTimeout = function () {
            startGame();
        }

        if (connectingNum >= 4) {
            socket.emit('responce', {result:false, message: '既にプレイヤーが4人集まっています。\nまた後で接続をお試しください。'});
            return ;
        }     

        var i = -1;
        if (currentState != fieldStates.result) {
            for (i=0; i<4; i++) {
                if (connectingList[i] == NPC) {
                    connectingList[i] = socket.id;
                    connectingDict[socket.id] = i;
                    connectingNum++;

                    io.of('/monitor').emit('setPlayer', i);

                    /*if (currentState == fieldStates.playing && stoneNum[i] < stoneMax) {
                        socket.emit('allowShot');
                    }*/
                    break;
                }
            }
        }

        if (currentState == fieldStates.entry) {
            if (timeoutID) clearTimeout(timeoutID);
            if (connectingNum != 4) timeoutID = setTimeout(startGame, 5000);
            else startGame();
        }

        socket.on('shot', sendOnShot);
        socket.on('disconnect', sendOnDisconnection);

        socket.emit('responce', {result:true, state:currentState, id:i});
    };

    socket.on('establish', sendOnEstablish);
};

var monitorOnConnection = function (socket) {
    socket.on('disconnect', function () {
    });

    if (currentState == fieldStates.playing || currentState == fieldStates.result) {
        var reconnectList = [];

        for (var i=0; i<4; i++) {
            reconnectList[i] = {stones: [], stoneCount: stoneNum[i]};

            for (var s=0; s<stoneList[i].length; s++) {
                var stone = stoneList[i][s];

                if (!stone.isDisabled) {
                    reconnectList[i].stones.push({sid: s, x: stone.coordinate[0], y: stone.coordinate[1]});
                }
            }
        }


        socket.emit('reconnect', reconnectList);
        if (currentState == fieldStates.result) {
            var pointList = calculatePoint();
            socket.emit('result', pointList);
        }
    } else {
        socket.emit('entry');
    }
};

function distanceBetween(p1, p2) {
    return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
}

function vectorAddition(v1, v2, weight) {
    return [v1[0] + v2[0] * weight, v1[1] + v2[1] * weight];
}

function polarToRect(r, theta) {
    return [r * Math.sin(theta), r * Math.cos(theta)];
}

function rectToPolar(point) {
    return { "r": distanceBetween(point, [0, 0]), "theta": (point[1] == 0) ? 0 : ((point[1] > 0) ? Math.atan(point[0] / point[1]) : (Math.atan(point[0] / point[1]) + Math.PI)) };
}

var updateNPC = function() {
    var i;

    for (i=0; i<4; i++) {
        if (connectingList[i] != NPC) continue;

        if (NPCInterval[i] == -1) {
            var func = (function (i) {
                return function () {
                if (stoneNum[i] >= stoneMax || connectingList[i] != NPC) return ;

                var tan;
                var coordinate = chooseAppearCoordinate(i, Math.random());
                if (Math.random() < 0.50) {
                    tan = Math.random() * (10000 - Math.tan(Math.PI/3.0)) + Math.tan(Math.PI/3.0);
                } else {
                    tan = Math.random() * (Math.tan(Math.PI*2/3.0) - (-10000)) + -10000;
                }
        
                var power = -(Math.random() * (35 - 5.0) + 5.0);
        
                var speed = rotateSpeed(i, [power/tan, power]);

                if (currentState == fieldStates.playing) {
                    createStone(i, 10.0, 10.0, 87.5, coordinate, speed);
                    stoneNum[i]++;
                }

                NPCInterval[i] = -1;
            };})(i);

            NPCInterval[i] = Math.random() * (15000.0 - 800.0) + 800.0;
            setTimeout(func, NPCInterval[i]);
        }

    }
}

var updateStones = function () {
    var moveStoneList = [[], [], [], []];
    var deleteStoneList = [[], [], [], []];
 
    if (currentState != fieldStates.playing) return ;
 
    for (var i=0; i<4; i++) {
        for (var s=0; s<stoneList[i].length; s++) {
            var stone = stoneList[i][s];
            var friction = 0.993;
            var speedMin = 0.1;

            if (stone.isDisabled) continue;

            if (stone.speed[0] != 0 || stone.speed[1] != 0) {
                stone.speed[0] *= friction;
                stone.speed[1] *= friction;
    
                if (Math.abs(stone.speed[0]) < speedMin) stone.speed[0] = 0;
                if (Math.abs(stone.speed[1]) < speedMin) stone.speed[1] = 0;

                stone.coordinate[0] += stone.speed[0];
                stone.coordinate[1] += stone.speed[1];
            }

            for (var j=i; j<4; j++) {
                for (var t = (i==j)?s+1:0; t<stoneList[j].length; t++) {
                    var stone2 = stoneList[j][t];
    
                    if (!stone2 || stone2.isDisabled) continue;
    
                    var len = distanceBetween(stone.coordinate, stone2.coordinate);
                    var subsidence = (stone.size + stone2.size) - len;
    
                    if (subsidence > 0) {
                        var t;
                        var vx = stone.coordinate[0] - stone2.coordinate[0];
                        var vy = stone.coordinate[1] - stone2.coordinate[1];

                        vx /= len;
                        vy /= len;
    
                        subsidence /= 2.0;
                        stone.coordinate[0] += vx * subsidence;
                        stone.coordinate[1] += vy * subsidence;
                        stone2.coordinate[0] -= vx * subsidence;
                        stone2.coordinate[1] -= vy * subsidence;
    
                        vx = -vx;
                        vy = -vy;
                        t = -(vx * stone.speed[0] + vy * stone.speed[1]) / (vx * vx + vy * vy);
                        var arx = stone.speed[0] + vx * t;
                        var ary = stone.speed[1] + vy * t;
                        
                        t = -(-vy * stone.speed[0] + vx * stone.speed[1]) / (vy * vy + vx * vx);
                        var amx = stone.speed[0] - vy * t;
                        var amy = stone.speed[1] + vx * t;
                        
                        t = -(vx * stone2.speed[0] + vy * stone2.speed[1]) / (vx * vx + vy * vy);
                        var brx = stone2.speed[0] + vx * t;
                        var bry = stone2.speed[1] + vy * t;
                        
                        t = -(-vy * stone2.speed[0] + vx * stone2.speed[1]) / (vy * vy + vx * vx);
                        var bmx = stone2.speed[0] - vy * t;
                        var bmy = stone2.speed[1] + vx * t;
    
    
                        var e = 1.0;
                        var adx = (stone.weight * amx + stone2.weight * bmx + bmx * e * stone2.weight - amx * e * stone2.weight) / (stone.weight + stone2.weight);
                        var bdx = - e * (bmx - amx) + adx;
                        var ady = (stone.weight * amy + stone2.weight * bmy + bmy * e * stone2.weight - amy * e * stone2.weight) / (stone.weight + stone2.weight);
                        var bdy = - e * (bmy - amy) + ady;
    
                        stone.speed[0] = adx + arx;
                        stone.speed[1] = ady + ary;
                        stone2.speed[0] = bdx + brx;
                        stone2.speed[1] = bdy + bry;
                    }
                }
            }

            if (stone.speed[0] == 0 && stone.speed[1] == 0 && distanceBetween(stone.coordinate, [0, 0]) > fieldSize) {
                stone.isDisabled = true;

                deleteStoneList[i].push(s);
            } else if (stone.speed[0] != 0 || stone.speed[1] != 0) {
                moveStoneList[i].push({sid:s, x:stone.coordinate[0], y:stone.coordinate[1]});
            }
        }
    }

    io.of('/monitor').emit('moveStones', moveStoneList);
    io.of('/monitor').emit('deleteStones', deleteStoneList);
};

var timerRoop = function () {
    var mainRoopID = setInterval(function () {
        updateNPC();
        updateStones();
        frame++;
    }, 1000.0 / worldFPS);

    var timerRoopID = setInterval(function () { 
        gameTime++;

        if (gameTime == 60) {
            gameTime = 0;
            currentState = fieldStates.result;
            clearInterval(mainRoopID);
            clearInterval(timerRoopID);

            io.of('/send').emit('timeup');
            io.of('/monitor').emit('timeup');

            resultGame();

            return ;
        }

        io.of('/monitor').emit('tick', 60 - gameTime);
    }, 1000.0);
};

var startGame = function () {
    currentState = fieldStates.playing;

    io.of('/send').emit('start');
    //io.of('/send').emit('allowShot');
    io.of('/monitor').emit('start');
    
    timerRoop();
}

var calculatePoint = function () {
    var pointList = [];

    for (var i=0; i<4; i++) {
        var pointSum = 0;

        for (var s=0; s<stoneList[i].length; s++) {
            var stone = stoneList[i][s];
            if (stone.isDisabled) continue;

            var distance = distanceBetween(stone.coordinate, [0, 0]);

            if (distance <= 125 + stone.size) {
                pointSum += 100;
            } else if (distance <= 375 + stone.size) {
                pointSum += 50;
            } else if (distance <= 625 + stone.size) {
                pointSum += 20;
            } else if (distance <= 875 + stone.size) {
                pointSum += 10;
            }
        }

        pointList.push(pointSum);
    }

    return pointList;
}


var resultGame = function () {
    var startEntry = function () {
        currentState = fieldStates.entry;
        stoneList = [[], [], [], []];
        stoneNum = [0, 0, 0, 0];

        connectingNum = 0;
        connectingList = [NPC, NPC, NPC, NPC];
        connectingDict = new Object();
        
        NPCInterval = [-1, -1, -1, -1];

        io.of('/monitor').emit('entry');

        return ;
    };

    var pointList = calculatePoint();
    currentState = fieldStates.result;
    io.of('/monitor').emit('result', pointList);

    setTimeout(startEntry, 10000.0);
}

var main = function () {
    app.listen(8090);
    io.set('log level', 1);

    io.of('/send').on('connection', sendOnConnection);
    io.of('/monitor').on('connection', monitorOnConnection);

}

main();
