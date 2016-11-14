var ticker = PIXI.ticker.shared;
ticker.autoStart = false;
ticker.stop();

var renderer = new PIXI.autoDetectRenderer(800, 480);
renderer.backgroundColor = 0x333333;
renderer.roundPixels = true;
document.body.appendChild(renderer.view);

var preloader = new Preloader(renderer);
var level = null;//new Level('level0', renderer);
var menu = new Menu(renderer);
var currentScene = preloader;

function tick(length) {
    currentScene.Tick(length);
}

ticker.add(tick)
ticker.start();

preloader.on('ready', function () {
	currentScene = menu;
});

document.addEventListener('keydown', onkeydown);
document.addEventListener('keyup', onkeyup);
renderer.view.addEventListener('mousedown', mouse.down);
renderer.view.addEventListener('mousemove', mouse.move);
renderer.view.addEventListener('mouseup', mouse.up);
renderer.view.addEventListener('click', function () {window.focus()});
renderer.view.oncontextmenu = function () { return false; }

window.focus();