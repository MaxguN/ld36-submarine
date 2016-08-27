var ticker = PIXI.ticker.shared;
ticker.autoStart = false;
ticker.stop();

var renderer = new PIXI.autoDetectRenderer(800, 480);
renderer.backgroundColor = 0xFFFFFF;
document.body.appendChild(renderer.view);

var level = new Level('level0', renderer);

function tick(length) {
    level.Tick(length);
}

ticker.add(tick)

level.on('ready', function () {
    ticker.start();
})