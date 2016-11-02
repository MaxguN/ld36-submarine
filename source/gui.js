function GUI(level) {
	this.level = level;

	this.gradientContext = document.createElement('canvas').getContext('2d');
	this.gradient = null;
	this.cursor = new PIXI.Graphics();

	this.energyGauge = new PIXI.Graphics();
	this.energyValue = new PIXI.Text("0:00");
	this.airGauge = new PIXI.Graphics();
	this.airValue = new PIXI.Text("0:00");

	this.notifies = [];

	this.container = new PIXI.Container();

	this.isDisplayed = false;

	this.count = 1;

	this.Init();
}

GUI.prototype.Init = function () {
	var self = this;
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

	this.cursor.lineStyle(2, 0x333333, 1);
	this.cursor.drawRoundedRect(0, 0, 0, 16, 2);

	this.level.GetObjects(Tags.Seamark).forEach(function (seamark) {
		var notify = new Animator(0, 0, this.container)
		load.json('animations/notify.json', function (data) { notify.Init(data); });
		notify.Hide();
		this.notifies.push(notify);
	}, this);

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

GUI.prototype.ResetRadar = function () {
	this.container.removeChild(this.gradient);
	this.gradient = null;
}

GUI.prototype.Display = function () {
	this.level.gui.addChild(this.container);
	this.Unlock();
	this.isDisplayed = true;
}

GUI.prototype.Tick = function (length) {
	var energy = this.level.submarine.energy / this.level.submarine.energyCapacity;
	var air = this.level.submarine.air / this.level.submarine.airCapacity;

	var energyTime = Math.ceil(energy * this.level.submarine.energyCapacity);
	var airTime = Math.ceil(air * this.level.submarine.airCapacity);

	this.energyGauge.clear();
	this.energyGauge.beginFill(0xcccc00, 1);
	this.energyGauge.drawRoundedRect(33, 9, Math.max(0, 98 * energy), 14, 5);
	this.energyValue.text = energyTime === 60 ? "1:00" : "0:" + (energyTime < 10 ? "0" : "") + energyTime;

	this.airGauge.clear();
	this.airGauge.beginFill(0x0000cc, 1);
	this.airGauge.drawRoundedRect(33, 33, Math.max(0, 98 * air), 14, 5);
	this.airValue.text = "0:" + (airTime < 10 ? "0" : "") + airTime;

	if (keydown[keys.r] && !this.gradient) {
		var gradient = this.gradientContext.createLinearGradient(0, 0, 100, 0);
		gradient.addColorStop(0, '#00FF00');
		gradient.addColorStop(0.75, '#FFFF00');
		gradient.addColorStop(1, '#FF0000');
		this.gradientContext.fillStyle = gradient;
		this.gradientContext.fillRect(0, 0, 100, 16);

		this.gradient = new PIXI.Sprite(PIXI.Texture.fromCanvas(this.gradientContext.canvas));
		this.gradient.position = new PIXI.Point((this.level.window.w - 100) / 2 , this.level.window.h / 2 - 48);

		this.gradient.addChild(this.cursor);
		this.container.addChild(this.gradient);
	}

	if (this.gradient) {
		this.cursor.x = this.level.submarine.radar;
	}

	this.level.GetObjects(Tags.Seamark).forEach(function (seamark, index) {
		var notify = this.notifies[index];
		if (seamark.notify) {
			var width = this.level.window.w;
			var height = this.level.window.h;
			var x = this.level.submarine.x + this.level.game.x;
			var y = this.level.submarine.y + this.level.game.y;
			var dx = seamark.x - this.level.submarine.x;
			var dy = seamark.y - this.level.submarine.y;
			var diffx = 0;
			var diffy = 0;
			var	rs = 0;
			var t = 0;
			var u = 0;

			var segments = {
				top : { x : 0, y : 0, dx : width, dy : 0},
				right : { x : width, y : 0, dx : 0, dy : height},
				bottom : { x : 0, y : height, dx : width, dy : 0},
				left : { x : 0, y : 0, dx : 0, dy : height}
			}

			for (var way in segments) {
				diffx = x - segments[way].x;
				diffy = y - segments[way].y;
				rs = (segments[way].dx * dy - segments[way].dy * dx);

				if (rs) {
					t = (diffx * dy - diffy * dx) / rs;
					u = (diffx * segments[way].dy - diffy * segments[way].dx) / rs;

					if (t > 0 && t < 1 && u > 0 && u < 1) {
						break;
					}
				}
			}

			if (t > 0 && t < 1 && u > 0 && u < 1) {
				notify.MoveTo(x + u * dx, y + u * dy);
				
				notify.Display();
			} else {
				notify.Hide();
			}
		} else {
			notify.Hide();
		}
	}, this);
}