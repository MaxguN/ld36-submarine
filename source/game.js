var ticker = PIXI.ticker.shared;
ticker.autoStart = false;
ticker.stop();

var renderer = new PIXI.autoDetectRenderer(800, 480);
renderer.backgroundColor = 0x333333;
document.body.appendChild(renderer.view);

var level = null;//new Level('level0', renderer);
var menu = new Menu(renderer);

var currentScene = menu;

function tick(length) {
    currentScene.Tick(length);
}

function preload(level) {
	load.json('levels/' + level + '.json', function (data) {
		data.tilesets.forEach(function (tileset, index) {
			var texture = new Image();
			texture.src = tileset.image;
		});
	});
}

preload('level1');

ticker.add(tick)

currentScene.on('ready', function () {
    ticker.start();
});

document.addEventListener('keydown', onkeydown);
document.addEventListener('keyup', onkeyup);
renderer.view.addEventListener('mousedown', mouse.down);
renderer.view.addEventListener('mousemove', mouse.move);
renderer.view.addEventListener('mouseup', mouse.up);
renderer.view.addEventListener('click', function () {window.focus()});
renderer.view.oncontextmenu = function () { return false; }

window.focus();