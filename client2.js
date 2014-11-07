		var isWaitingAllowShot = false;
		var isCatchingStone = false;

		var thrownStone = new paper.Shape.Circle({
			center: [$(window).width()/2, $(window).height()*3/4],
			radius: 30, fillColor: uColors[socketid],
		});

		thrownStone.onMouseDown = function (e){
			if (!isWaitingAllowShot){
				paper.view.detach('frame', thrownStone.onFrame);
				isCatchingStone = true;
			}
		};

		setInterval(function (){
			if(isCatchingStone && MouseX)
				thrownStone.position = new paper.Point(MouseX, MouseY);
		}, 1000.0 / 60);

		function OnStonemove(e, ec){
			if (isCatchingStone) {
				StartTime = PreviousTime;
				PreviousTime = (new Date()).getTime();
				StartPosition = PreviousPosition;
				PreviousPosition = new paper.Point(ec.clientX, ec.clientY);
				MouseX = ec.clientX;
				MouseY = ec.clientY;
			}
			e.preventDefault();
		}
		function OnStoneEnd(ec){
			var endTime = (new Date()).getTime();
			isCatchingStone = false;
			MouseX = undefined;
			MouseY = undefined;

			if (StartPosition && !isWaitingAllowShot) {
				var endPosition = new paper.Point(ec.clientX, ec.clientY);
				var speed = calculateSpeed(StartPosition, endPosition, endTime - StartTime);

				thrownStone.onFrame = function (event) {
					if (thrownStone.position.y <= -thrownStone.radius) {
						isWaitingAllowShot = true;
						socket.emit('shot', {speed: speed, appearPos: thrownStone.position.x/$(window).width()});

						startPosition = null;
						paper.view.detach('frame', thrownStone.onFrame);
						thrownStone.onFrame = null;
						speed[0] = speed[1] = 0;

						return ;
					} else if (thrownStone.position.y > $(window).height() + thrownStone.radius) {
						paper.view.detach('frame', thrownStone.onFrame);
						thrownStone.onFrame = null;
						speed[0] = speed[1] = 0;
						startPosition = null;

						thrownStone.position.x = $(window).width()/2;
						thrownStone.position.y = $(window).height()*3/4;

						return ;
					} else if (thrownStone.position.x <= -thrownStone.radius) {
						paper.view.detach('frame', thrownStone.onFrame);
						thrownStone.onFrame = null;
						speed[0] = speed[1] = 0;
						startPosition = null;

						thrownStone.position.x = $(window).width()/2;
						thrownStone.position.y = $(window).height()*3/4;

						return ;
					} else if (thrownStone.position.x > $(window).width() + thrownStone.radius) {
						paper.view.detach('frame', thrownStone.onFrame);
						thrownStone.onFrame = null;
						speed[0] = speed[1] = 0;
						startPosition = null;

						thrownStone.position.x = $(window).width()/2;
						thrownStone.position.y = $(window).height()*3/4;

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


		var onShotAllowed = function () {
			isWaitingAllowShot = false;
			isCatchingStone = false;
			thrownStone.position.x = $(window).width()/2;
			thrownStone.position.y = $(window).height()*3/4;
		}
