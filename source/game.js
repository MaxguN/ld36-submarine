var ticker = PIXI.ticker.shared;
ticker.autoStart = false;
ticker.stop();

var renderer = new PIXI.autoDetectRenderer(800, 480);
renderer.backgroundColor = 0xFFFFFF;
document.body.appendChild(renderer.view);

var level = null;//new Level('level0', renderer);
var menu = new Menu(renderer);

var currentScene = menu;

function tick(length) {
    currentScene.Tick(length);
}

ticker.add(tick)

currentScene.on('ready', function () {
    ticker.start();
})