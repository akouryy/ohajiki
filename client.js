$(function () {
    const FieldStates = {entry: 0, playing: 2, result: 3};

    var socket = io.connect('http://' + location.host + '/send', 
        {resource: 'socket.io'});
    var socketid = 0;

    var canvas = document.getElementById('Canvas');
    paper.setup(canvas);

    var project = new paper.Project(canvas);

    var SVGURLs = ['img/bey01.svg', 'img/stage.svg', 'img/stone.svg'];
    var SVGcache = {};

    var FPStext = new paper.PointText(new paper.Point(10, 20));
    FPStext.fillColor = 'black';

        const uColors = ['#cc3333', '#cccc33', '#33cc33', '#3333cc'];
        var PreviousPosition = null;
        var StartPosition = null;
        var PreviousTime = null;
        var StartTime = null;
        var EnableShotDiscance = 50.0;
        var MouseX;
        var MouseY;
    FPS = 0;

    setInterval(function () {
        FPStext.content = 'FPS: ' + FPS;
        FPS = 0;
    }, 1000);

    nowLoadingText = new paper.PointText({
        point: paper.view.center,
        content: 'Now Loading...',
        fillColor: 'black',
        fontSize: 24,
        justification: 'center'
    });

    paper.view.draw();

    var getData = function(name)  {
        return SVGcache[name] || $.ajax(
            name, {
                success: function (data) {
                    SVGcache[name] = data;
                }
            });
    };

    var setup = function () {
        nowLoadingText.remove();

        socket.on('disconnect', function (message) {
            project.activeLayer.removeChildren();
            window06setup();
        });

        paper.view.onFrame = function (event) {
            FPS++;
        };

        window01setup();
    };

    var joinRequest = function () {
        socket.on('responce', function (data) {
            socket.removeAllListeners('responce');

            if (data.result != true) {
                window04setup(data.message);
            } else {
                socketid = data.id;

                if (data.state == FieldStates.entry) {
                    window02setup();
                } else if (data.state == FieldStates.playing) {
                    window03setup();
                } else if (data.state == FieldStates.result) {
                    window05setup();
                }
            }
        });

        socket.emit('establish');
    }
        
    var window01setup = function () {
        var boundSize = Math.min(paper.view.size.width, paper.view.size.height) * 0.85;
        var boundRectangle = new paper.Rectangle();
        boundRectangle.size = [boundSize, boundSize];
        boundRectangle.center = paper.view.center;

        var infoWindow = new paper.Rectangle();
        infoWindow.center = paper.view.center;
        infoWindow.size = [600, 600];
        var infoWindowRounded = new paper.Path.RoundRectangle(infoWindow, new paper.Size(20, 20));
        infoWindowRounded.fillColor = 'black';
        infoWindowRounded.opacity = 0.6;

        var connectText = [];
        connectText[0] = new paper.PointText({ fillColor: 'white', justification: 'center' });
        connectText[1] = new paper.PointText({ fillColor: 'white', justification: 'center' });
        connectText[2] = new paper.PointText({ fillColor: 'white', justification: 'left' });
        connectText[3] = new paper.PointText({ fillColor: 'white', justification: 'left' });

        connectText[0].content = 'NPCA Ohajiki';
        connectText[0].point = infoWindow.center.add([0, -200]);
        connectText[0].fontSize = 60;
        connectText[1].content = '本日は灘校パソコン研究部ブースにお越し頂きありがとうございます。';
        connectText[1].point = infoWindow.center.add([0, -120]);
        connectText[1].fontSize = 20;
        connectText[2].content = '注意(必ずご確認ください)';
        connectText[2].point = infoWindow.leftCenter.add([20, -40]);
        connectText[2].fontSize = 20;
        connectText[3].content = '●本コンテンツではWebSocketを使用した通信を行います。\n　ご利用の際の通信料は各自の負担となりますので予めご了承ください。\n\n●プレイに際しては、画面の自動回転をOFFにし、\n　画面の点灯時間を長めに設定していただくと、\n　快適にプレイしていただけます。';
        connectText[3].point = infoWindow.leftCenter.add([38, 0]);
        connectText[3].fontSize = 17;

        var button01 = new paper.Rectangle();
        button01.center = infoWindow.center.add([0, 220]);
        button01.size = [400, 100];
        var button01Rounded = new paper.Path.RoundRectangle(button01, new paper.Size(20, 20));
        button01Rounded.fillColor = 'white';

        var buttonText01 = new paper.PointText({
            fillColor: 'black',
            justification: 'center',
            position: button01Rounded.position.add([0, 20]),
            fontSize: 48,
            content: 'OK'
        })

        var buttonGroup = new paper.Group([button01Rounded, buttonText01]);

        var message01 = new paper.Group([infoWindowRounded, connectText[0], connectText[1], connectText[2], connectText[3], buttonGroup]);

        message01.fitBounds(boundRectangle);

        buttonGroup.onMouseDown = function (event) {
            message01.remove();

            joinRequest();
        };
    };


    var window02setup = function () {
        var windowCreatedTime = (new Date);

        var boundSize = Math.min(paper.view.size.width, paper.view.size.height) * 0.85;
        var boundRectangle = new paper.Rectangle();
        boundRectangle.size = [boundSize, boundSize];
        boundRectangle.center = paper.view.center;

        var infoWindow = new paper.Rectangle();
        infoWindow.center = paper.view.center;
        infoWindow.size = [600, 600];
        var infoWindowRounded = new paper.Path.RoundRectangle(infoWindow, new paper.Size(20, 20));
        infoWindowRounded.fillColor = 'black';
        infoWindowRounded.opacity = 0.6;

        var connectText = [];
        for (var i = 0; i < 2; i++) {
            connectText[i] = new paper.PointText({ fillColor: 'white', justification: 'center' });
        }
        connectText[0].content = 'Please wait...';
        connectText[0].point = infoWindow.center.add([0, -200]);
        connectText[0].fontSize = 60;
        connectText[1].content = '他の参加者を募集しています。\nゲーム開始までお待ちください。';
        connectText[1].point = infoWindow.center.add([0, 0]);
        connectText[1].fontSize = 32;

        var message02 = new paper.Group([infoWindowRounded, connectText[0], connectText[1]]);

        message02.fitBounds(boundRectangle);

        var onStart = function () {
                message02.remove();

                        var onDevicemotion = function (e) {
                            var x = e.acceleration.x;
                            var y = e.acceleration.y;
                            var z = e.acceleration.z;
                            socket.emit('sensor', x*x + y*y + z*z);
                        };

                        window.addEventListener("devicemotion", onDevicemotion);
                        
            window03setup();
        };

        socket.on('start', onStart);
    };

    var window03setup = function () {
        var calculateSpeed = function (start, end) {
            var width = $(window).width();
            var height = $(window).height()

            return [(start.x - end.x)/width * 60, (start.y - end.y)/height * 60];
        }

        var boundSize = Math.min(paper.view.size.width, paper.view.size.height) * 0.85;
        var boundRectangle = new paper.Rectangle();
        boundRectangle.size = [boundSize, boundSize];
        boundRectangle.center = paper.view.center;

        var infoWindow = new paper.Rectangle();
        infoWindow.center = paper.view.center;
        infoWindow.size = [600, 600];
        var infoWindowRounded = new paper.Path.RoundRectangle(infoWindow, new paper.Size(20, 20));
        infoWindowRounded.fillColor = 'white';
        infoWindowRounded.opacity = 0.6;

        var isWaitingAllowShot = false;
        var isCatchingStone = false;

        var thrownStone = new paper.Shape.Circle({
            center: [$(window).width()/2, $(window).height()/6],
            radius: 30.0, fillColor: uColors[socketid],
        });

        var onShotAllowed = function () {
            thrownStone.position.x = $(window).width()/2;
            thrownStone.position.y = $(window).height()/6;
            thrownStone.bounds.width = 1;
            thrownStone.bounds.height = 1;
            paper.view.draw();

            thrownStone.onFrame = function (event) {
                 if (thrownStone.bounds.width < 60.00) {
                     thrownStone.bounds.width += 3;
                     thrownStone.bounds.height += 3;
                 } else {
                     thrownStone.bounds.width = 60.0;
                     thrownStone.bounds.height = 60.0;
                     paper.view.detach('frame', thrownStone.onFrame);
                     thrownStone.onFrame = null;
                     isWaitingAllowShot = false;
                 }

                 thrownStone.position.x = $(window).width()/2;
                 thrownStone.position.y = $(window).height()/6;
                 paper.view.draw();
                 FPS++;
            };
            paper.view.attach('frame', thrownStone.onFrame);
        }

        socket.on('allowShot', onShotAllowed);

        thrownStone.onMouseDown = function (e){
            if (!isWaitingAllowShot){
                if (thrownStone.onFrame) {
                    paper.view.detach('frame', thrownStone.onFrame);
                    thrownStone.onFrame = null;
                }

                if (MouseX && MouseY) {
                    thrownStone.position.x = MouseX;
                    thrownStone.position.y = MouseY;
                } else {
                    thrownStone.position.x = $(window).width()/2;
                    thrownStone.position.y = $(window).height()/6;
                }
                StartPosition = new paper.Point($(window).width()/2, $(window).height()/6);
                isCatchingStone = true;
            }
        };

        var stoneMoveID = setInterval(function (){
            if(isCatchingStone && MouseX && MouseY)
                thrownStone.position = new paper.Point(MouseX, MouseY);
        }, 1000.0 / 60);

        function OnStonemove(e, ec){
            MouseX = ec.clientX;
            MouseY = ec.clientY;
        }

        function OnStoneEnd(ec){
            if(!isCatchingStone) return;
            isCatchingStone = false;

            if (StartPosition && !isWaitingAllowShot) {
                var endPosition = new paper.Point(ec.clientX, ec.clientY);
                var speed = calculateSpeed(StartPosition, endPosition);

                thrownStone.onFrame = function (event) {
                    if (thrownStone.position.y <= -thrownStone.radius) {
                        isWaitingAllowShot = true;
                        socket.emit('shot', {speed: speed, appearPos: thrownStone.position.x/$(window).width()});

                        StartPosition = null;
                        paper.view.detach('frame', thrownStone.onFrame);
                        thrownStone.onFrame = null;

                        return ;
                    } else if (thrownStone.position.y > $(window).height() + thrownStone.radius) {
                        paper.view.detach('frame', thrownStone.onFrame);
                        thrownStone.onFrame = null;
                        StartPosition = null;

                        thrownStone.position.x = $(window).width()/2;
                        thrownStone.position.y = $(window).height()/6;

                        return ;
                    } else if (thrownStone.position.x <= -thrownStone.radius) {
                        paper.view.detach('frame', thrownStone.onFrame);
                        thrownStone.onFrame = null;
                        StartPosition = null;

                        thrownStone.position.x = $(window).width()/2;
                        thrownStone.position.y = $(window).height()/6;

                        return ;
                    } else if (thrownStone.position.x > $(window).width() + thrownStone.radius) {
                        paper.view.detach('frame', thrownStone.onFrame);
                        thrownStone.onFrame = null;
                        StartPosition = null;

                        thrownStone.position.x = $(window).width()/6;
                        thrownStone.position.y = $(window).height()/2;

                        return ;
                    } else {
                        thrownStone.position.x += speed[0];
                        thrownStone.position.y += speed[1];
                    }

                    FPS++;
                };
                paper.view.attach('frame', thrownStone.onFrame);
            }
        }
        $("canvas").on('mousemove', function(e){ OnStonemove(e, e) });
        $("canvas").on('touchmove', function(e){ OnStonemove(e, e.originalEvent.changedTouches[0]); });

        $("canvas").on('mouseup', function (e){ OnStoneEnd(e) });
        $("canvas").on('touchend', function (e){ OnStoneEnd(e.originalEvent.changedTouches[0]) });

        var message03 = new paper.Group([infoWindowRounded, thrownStone]);

        var onTimeup = function () {
            $("canvas").unbind('mousemove');
            $("canvas").unbind('touchmove');

            $("canvas").unbind('mouseup');
            $("canvas").unbind('touchend');

            clearInterval(stoneMoveID);
            thrownStone.remove();
            message03.remove();
            window05setup();
        };

        socket.on('timeup', onTimeup);
    };

    var window04setup = function (message) {
        var windowCreatedTime = (new Date);

        var boundSize = Math.min(paper.view.size.width, paper.view.size.height) * 0.85;
        var boundRectangle = new paper.Rectangle();
        boundRectangle.size = [boundSize, boundSize];
        boundRectangle.center = paper.view.center;

        var infoWindow = new paper.Rectangle();
        infoWindow.center = paper.view.center;
        infoWindow.size = [600, 600];
        var infoWindowRounded = new paper.Path.RoundRectangle(infoWindow, new paper.Size(20, 20));
        infoWindowRounded.fillColor = 'black';
        infoWindowRounded.opacity = 0.6;

        var connectText = [];
        for (var i = 0; i < 1; i++) {
            connectText[i] = new paper.PointText({ fillColor: 'white', justification: 'center' });
        }
        connectText[0].content = message;
        connectText[0].point = infoWindow.center.add([0, -50]);
        connectText[0].fontSize = 20;

        var button = new paper.Rectangle();
        button.center = infoWindow.center.add([0, 220]);
        button.size = [400, 100];
        var buttonRounded = new paper.Path.RoundRectangle(button, new paper.Size(20, 20));
        buttonRounded.fillColor = 'white';

        var buttonText = new paper.PointText({
            fillColor: 'black',
            justification: 'center',
            position: buttonRounded.position.add([0, 20]),
            fontSize: 40,
            content: '再接続'
        });

        var buttonGroup = new paper.Group([buttonRounded, buttonText]);

        var message04 = new paper.Group([infoWindowRounded, connectText[0], buttonGroup]);

        message04.fitBounds(boundRectangle);
 
        buttonGroup.onMouseDown = function (event) {
            message04.remove();
            window.location.reload();
        };

        socket.removeAllListeners('disconnect');
    };

    var window05setup = function (data) {
        var windowCreatedTime = (new Date);

        var boundSize = Math.min(paper.view.size.width, paper.view.size.height) * 0.85;
        var boundRectangle = new paper.Rectangle();
        boundRectangle.size = [boundSize, boundSize];
        boundRectangle.center = paper.view.center;

        var infoWindow = new paper.Rectangle();
        infoWindow.center = paper.view.center;
        infoWindow.size = [600, 600];
        var infoWindowRounded = new paper.Path.RoundRectangle(infoWindow, new paper.Size(20, 20));
        infoWindowRounded.fillColor = 'black';
        infoWindowRounded.opacity = 0.6;

        var connectText = [];
        for (var i = 0; i < 2; i++) {
            connectText[i] = new paper.PointText({ fillColor: 'white', justification: 'center' });
        }
        connectText[0].content = 'タイムアップ！';
        connectText[0].point = infoWindow.center.add([0, -200]);
        connectText[0].fontSize = 36;
        connectText[1].content = 'お疲れ様でした。\nモニターの結果発表をご覧ください。';
        connectText[1].point = infoWindow.center.add([0, 0]);
        connectText[1].fontSize = 24;

        var button = new paper.Rectangle();
        button.center = infoWindow.center.add([0, 220]);
        button.size = [400, 100];
        var buttonRounded = new paper.Path.RoundRectangle(button, new paper.Size(20, 20));
        buttonRounded.fillColor = 'white';

        var buttonText = new paper.PointText({
            fillColor: 'black',
            justification: 'center',
            position: infoWindow.center.add([0, 240]),
            fontSize: 48,
            content: 'もう一度遊ぶ'
        });

        var buttonGroup = new paper.Group([buttonRounded, buttonText]);

        var message05 = new paper.Group([infoWindowRounded, connectText[0], connectText[1], buttonGroup]);

        message05.fitBounds(boundRectangle);

        buttonGroup.onMouseDown = function (event) {
            infoWindowRounded.remove();
            message05.remove();
            window.location.reload();
        };

        socket.removeAllListeners('disconnect');
    };

    var window06setup = function () {
        var boundSize = Math.min(paper.view.size.width, paper.view.size.height) * 0.85;
        var boundRectangle = new paper.Rectangle();
        boundRectangle.size = [boundSize, boundSize];
        boundRectangle.center = paper.view.center;

        var infoWindow = new paper.Rectangle();
        infoWindow.center = paper.view.center;
        infoWindow.size = [600, 600];
        var infoWindowRounded = new paper.Path.RoundRectangle(infoWindow, new paper.Size(20, 20));
        infoWindowRounded.fillColor = 'black';
        infoWindowRounded.opacity = 0.6;

        var connectText = [];
        for (var i = 0; i < 1; i++) {
            connectText[i] = new paper.PointText({ fillColor: 'white', justification: 'center' });
        }
        connectText[0].content = '接続が切断されました。\n電波状況を確認してもう一度お試しください。';
        connectText[0].point = infoWindow.center.add([0, 0]);
        connectText[0].fontSize = 26;

        var button = new paper.Rectangle();
        button.center = infoWindow.center.add([0, 220]);
        button.size = [400, 100];
        var buttonRounded = new paper.Path.RoundRectangle(button, new paper.Size(20, 20));
        buttonRounded.fillColor = 'white';


        var buttonText = new paper.PointText({
            fillColor: 'black',
            justification: 'center',
            position: buttonRounded.position.add([0, 20]),
            fontSize: 40,
            content: '再接続'
        });

        var buttonGroup = new paper.Group([buttonRounded, buttonText]);
        var message06 = new paper.Group([infoWindowRounded, connectText[0], buttonGroup]);

        message06.fitBounds(boundRectangle);

        buttonGroup.onMouseDown = function (event) {
            message06.remove();
                    window.location.reload();
        };

        paper.view.draw();
    };

    deferredObjects = [];
    for (var i = 0; i < SVGURLs.length; i++) {
        deferredObjects.push(getData(SVGURLs[i]));
    }

    $.when.apply(null, deferredObjects).done(setup);
});
