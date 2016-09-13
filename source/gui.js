function GUI(level) {
	this.level = level;

	this.energyGauge = new PIXI.Graphics();
	this.energyValue = new PIXI.Text("1:00");
	this.airGauge = new PIXI.Graphics();
	this.airValue = new PIXI.Text("0:30");

	this.container = new PIXI.Container();

	this.isDisplayed = false;

	this.count = 1;

	this.Init();
}

GUI.prototype.Init = function () {
	var energyBackground = new PIXI.Graphics();
	var energyIcon = PIXI.Sprite.fromImage('textures/icons/energy.png');
	var airBackground = new PIXI.Graphics();
	var airIcon = PIXI.Sprite.fromImage('textures/icons/air.png');

	energyBackground.beginFill(0x333333, 1);
	energyBackground.lineStyle(2, 0xcccccc, 1);
	energyBackground.drawRoundedRect(32, 8, 100, 16, 5);
	energyIcon.position = new PIXI.Point(8, 8);
	this.energyGauge.beginFill(0xcccc00, 1);
	this.energyGauge.drawRoundedRect(32, 8, 100, 16, 5);
	this.energyValue.style = {fontFamily : 'monospace', fontSize: 16, fill : 0xeeeeee};
	this.energyValue.position = {x : 32 + (100 - this.energyValue.width) / 2, y : 9};

	airBackground.beginFill(0x333333, 1);
	airBackground.lineStyle(2, 0xcccccc, 1);
	airBackground.drawRoundedRect(32, 32, 100, 16, 5);
	airIcon.position = new PIXI.Point(8, 32);
	this.airGauge.beginFill(0x0000cc, 1);
	this.airGauge.drawRoundedRect(32, 32, 100, 16, 5);
	this.airValue.style = {fontFamily : 'monospace', fontSize: 16, fill : 0xeeeeee};
	this.airValue.position = {x : 32 + (100 - this.airValue.width) / 2, y : 33};

	this.container.addChild(energyIcon);
	this.container.addChild(energyBackground);
	this.container.addChild(airIcon);
	this.container.addChild(airBackground);

	this.container.addChild(this.energyGauge);
	this.container.addChild(this.energyValue);
	this.container.addChild(this.airGauge);
	this.container.addChild(this.airValue);

	this.Display();
}

GUI.prototype.Lock = function () {

}

GUI.prototype.Unlock = function () {

}

GUI.prototype.Hide = function () {
	this.Lock();
	this.level.gui.removeChild(this.container);
	this.isDisplayed = false;
}

GUI.prototype.Display = function () {
	this.level.gui.addChild(this.container);
	this.Unlock();
	this.isDisplayed = true;
}

GUI.prototype.Tick = function (length) {
	var energy = 1;
	var air = 1;

	var energyTime = Math.ceil(energy * 60);
	var airTime = Math.ceil(air * 30);

	this.energyGauge.clear();
	this.energyGauge.beginFill(0xcccc00, 1);
	this.energyGauge.drawRoundedRect(33, 9, Math.max(0, 98 * energy), 14, 5);
	this.energyValue.text = energyTime === 60 ? "1:00" : "0:" + (energyTime < 10 ? "0" : "") + energyTime;

	this.airGauge.clear();
	this.airGauge.beginFill(0x0000cc, 1);
	this.airGauge.drawRoundedRect(33, 33, Math.max(0, 98 * air), 14, 5);
	this.airValue.text = "0:" + (airTime < 10 ? "0" : "") + airTime;
}