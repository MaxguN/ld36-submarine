var keys = {
	escape : 27,
	space : 32,
	left : 37,
	up : 38,
	right : 39,
	down : 40,
	c : 67,
	r : 82,
	x : 88
}

var keydown = {};

function onkeydown(event) {
	if (keydown[event.keyCode] === undefined) {
		keydown[event.keyCode] = true;
	}
}

function onkeyup (event) {
	delete keydown[event.keyCode];
}

function IsMoving() {
	return (keydown[keys.left] || keydown[keys.right] || keydown[keys.up] || keydown[keys.down])
}

function GetDirection() {
	var direction = new PIXI.Point(0, 0);

	if (keydown[keys.left]) {
		direction.x -= 1;
	}

	if (keydown[keys.right]) {
		direction.x += 1;
	}

	if (keydown[keys.up]) {
		direction.y -= 1;
	}

	if (keydown[keys.down]) {
		direction.y += 1;
	}

	if (direction.x && direction.y) {
		direction.x *= 0.7071067811865476;
		direction.y *= 0.7071067811865476;
	}

	return direction;
}

var mouse = (function () {
	var listeners = {
		click : [],
		mousedown : [],
		mousemove : [],
		mouseup : []
	}

	function on(event, callback) {
		if (listeners[event]) {
			listeners[event].push(callback);
		}
	}

	function onmousedown(event) {
		mouse.left = (event.button === 0);
		mouse.middle = (event.button === 1);
		mouse.right = (event.button === 2);

		listeners.mousedown.forEach(function (listener) {
			listener(event);
		});
	}

	function onmousemove(event) {
		mouse.x = event.layerX;
		mouse.y = event.layerY;

		listeners.mousemove.forEach(function (listener) {
			listener(event);
		});
	}

	function onmouseup(event) {
		mouse.left = !(event.button === 0);
		mouse.middle = !(event.button === 1);
		mouse.right = !(event.button === 2);

		listeners.mouseup.forEach(function (listener) {
			listener(event);
		});
		listeners.click.forEach(function (listener) {
			listener(event);
		});
	}

	return {
		x : 0,
		y : 0,
		left : false,
		middle : false,
		right : false,
		on : on,
		down : onmousedown,
		move : onmousemove,
		up  :onmouseup
	};
})();

document.addEventListener('keydown', onkeydown);
document.addEventListener('keyup', onkeyup);
document.addEventListener('mousedown', mouse.down);
document.addEventListener('mousemove', mouse.move);
document.addEventListener('mouseup', mouse.up);