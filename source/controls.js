var keys = {
	escape : 'Escape',
	space : 'Space',
	ctrl : 'ControlLeft',
	shift : 'ShiftLeft',
	left : 'ArrowLeft',
	up : 'ArrowUp',
	right : 'ArrowRight',
	down : 'ArrowDown',
	w : 'KeyW',
	a : 'KeyA',
	s : 'KeyS',
	d : 'KeyD',
	i : 'KeyI',
	c : 'KeyC',
	r : 'KeyR',
	x : 'KeyX'
}

var keydown = {};
var diagValue = Math.sqrt(2) / 2;

function preventDefault(event) {
	switch (event.code) {
		case keys.space :
		case keys.up :
		case keys.left :
		case keys.down :
		case keys.right :
			event.preventDefault();
	}
}

function onkeydown(event) {
	preventDefault(event);
	if (keydown[event.code] === undefined) {
		keydown[event.code] = true;
	}
}

function onkeyup (event) {
	preventDefault(event);
	delete keydown[event.code];
}

function IsMoving() {
	return (keydown[keys.left] || keydown[keys.right] || keydown[keys.up] || keydown[keys.down] ||
			keydown[keys.w] || keydown[keys.a] || keydown[keys.s] || keydown[keys.d]);
}

function GetDirection() {
	var direction = new PIXI.Point(0, 0);

	if (keydown[keys.left] || keydown[keys.a]) {
		direction.x -= 1;
	}

	if (keydown[keys.right] || keydown[keys.d]) {
		direction.x += 1;
	}

	if (keydown[keys.up] || keydown[keys.w]) {
		direction.y -= 1;
	}

	if (keydown[keys.down] || keydown[keys.s]) {
		direction.y += 1;
	}

	if (direction.x && direction.y) {
		direction.x *= diagValue;
		direction.y *= diagValue;
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

	var data = {
		x : 0,
		y : 0,
		left : false,
		middle : false,
		right : false,
		on : on,
		off : off,
		down : onmousedown,
		move : onmousemove,
		up  : onmouseup
	};

	function on(event, callback) {
		if (listeners[event]) {
			listeners[event].push(callback);
		}
	}

	function off(event, callback) {
		var index = listeners[event].indexOf(callback);

		if (index !== -1) {
			listeners[event].splice(index, 1);
		}
	}

	function onmousedown(event) {
		data.left = (event.button === 0);
		data.middle = (event.button === 1);
		data.right = (event.button === 2);

		listeners.mousedown.forEach(function (listener) {
			listener(event);
		});
	}

	function onmousemove(event) {
		data.x = event.layerX;
		data.y = event.layerY;

		listeners.mousemove.forEach(function (listener) {
			listener(event);
		});
	}

	function onmouseup(event) {
		data.left = !(event.button === 0);
		data.middle = !(event.button === 1);
		data.right = !(event.button === 2);

		listeners.mouseup.forEach(function (listener) {
			listener(event);
		});
		listeners.click.forEach(function (listener) {
			listener(event);
		});
	}

	return data;
})();