function Inventory(item, level) {
	var self = this;

	this.level = level;

	this.isDisplayed = false;
	this.rectangle = new PIXI.Graphics();
	this.container = new PIXI.Container();

	this.parts = [];
	this.grabbed = null;

	this.listeners = {
		grab : function () {},
		move : function () {},
		release : function () {}
	}

	load.json('items/' + item + '.json', function (data) { self.Init(data);});
}

Inventory.prototype.Init = function (item) {
	var self = this;

	this.rectangle.beginFill(0xDDDDDD, 1);
	this.rectangle.lineStyle(2, 0x111111, 1);
	this.rectangle.drawRoundedRect(10, 10, 780, 460, 5);

	this.container.addChild(this.rectangle);

	item.parts.forEach(function (part, index) {
		this.parts[index] = PIXI.Sprite.fromImage('textures/' + item.name + '/' + part.image);
		this.parts[index].scale = new PIXI.Point(0.5, 0.5);
		this.parts[index].locked = true;
	}, this);

	this.listeners.grab = function (event) {
		if (event.button === 0) {
			self.parts.some(function (part) {
				if (!part.locked && part.containsPoint(mouse)) {
					self.grabbed = part;
					return true;
				}
			});
		}
	};
	this.listeners.move = function (event) {
		if (mouse.left && self.grabbed) {
			self.grabbed.x += event.movementX;
			self.grabbed.y += event.movementY;
		}
	};
	this.listeners.release = function (event) {
		if (event.button === 0) {
			self.grabbed = null;
		}
	};
}

Inventory.prototype.ItemUnlock = function (index) {
	if (this.parts[index] && this.parts[index].locked) {
		var x = 10 + Math.random() * (780 - this.parts[index].width);
		var y = 10 + Math.random() * (460 - this.parts[index].height);

		this.parts[index].position = new PIXI.Point(x, y);
		this.container.addChild(this.parts[index]);
		this.parts[index].locked = false;
	}
}

Inventory.prototype.Unlock = function () {
	mouse.on('mousedown', this.listeners.grab);
	mouse.on('mousemove', this.listeners.move);
	mouse.on('mouseup', this.listeners.release);
}

Inventory.prototype.Lock = function () {
	mouse.off('mousedown', this.listeners.grab);
	mouse.off('mousemove', this.listeners.move);
	mouse.off('mouseup', this.listeners.release);
}

Inventory.prototype.Hide = function () {
	this.Lock();
	this.level.gui.removeChild(this.container);
	this.isDisplayed = false;
}

Inventory.prototype.Display = function () {
	this.level.gui.addChild(this.container);
	this.Unlock();
	this.isDisplayed = true;
}

Inventory.prototype.IsOpened = function () {
	return this.isDisplayed;
}