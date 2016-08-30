function Inventory(item, level) {
	var self = this;

	this.level = level;

	this.isDisplayed = false;
	this.rectangle = new PIXI.Graphics();
	this.container = new PIXI.Container();

	this.unlocked = 0;
	this.parts = [];
	this.grabbed = null;
	this.attached = [];

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
		this.parts[index].index = index;
		this.parts[index].locked = true;
		this.parts[index].attach = part.attach;
		this.parts[index].attached = [];

		// this.ItemUnlock(index);
	}, this);

	this.listeners.grab = function (event) {
		if (event.button === 0) {
			self.parts.some(function (part) {
				if (!part.locked && part.containsPoint(mouse)) {
					self.grabbed = part;
					self.attached.push(part);

					var attached = [];
					var newAttached = part.attached;

					do {
						attached = newAttached;
						newAttached = [];

						self.attached.forEach(function (element) {
							var index;

							do {
								index = attached.indexOf(element);

								if (index > -1) {
									attached.splice(index, 1);
								}
							} while (index > -1);
						});

						attached.forEach(function (element) {
							self.attached.push(element);
							newAttached = newAttached.concat(element.attached);
						});
					} while (attached.length);

					return true;
				}
			});
		}
	};
	this.listeners.move = function (event) {
		if (mouse.left && self.grabbed) {
			self.attached.forEach(function (part) {
				part.x += event.movementX;
				part.y += event.movementY;
			});
		}
	};
	this.listeners.release = function (event) {
		if (event.button === 0) {
			self.grabbed.attach.forEach(function (attach) {
				if (!self.parts[attach.part].locked && self.grabbed.attached.indexOf(self.parts[attach.part]) === -1) {
					self.parts[attach.part].attach.some(function (otherAttach) {
						if (otherAttach.part === self.grabbed.index) {

							var x = self.grabbed.x + attach.x / 2;
							var y = self.grabbed.y + attach.y / 2;
							var ox = self.parts[attach.part].x + otherAttach.x / 2;
							var oy = self.parts[attach.part].y + otherAttach.y / 2;

							var circle = new PIXI.Circle(ox, oy, otherAttach.r / 2);

							if (circle.contains(x, y)) {
								self.attached.forEach(function (part) {
									part.x += ox - x;
									part.y += oy - y;
								});

								self.grabbed.attached.push(self.parts[attach.part]);
								self.parts[attach.part].attached.push(self.grabbed);

								var count = [self.parts[0]];
								var attached = [];
								var newAttached = self.parts[0].attached;

								do {
									attached = newAttached;
									newAttached = [];

									count.forEach(function (element) {
										var index;

										do {
											index = attached.indexOf(element);

											if (index > -1) {
												attached.splice(index, 1);
											}
										} while (index > -1);
									});

									attached.forEach(function (element) {
										count.push(element);
										newAttached = newAttached.concat(element.attached);
									});
								} while (attached.length);

								if (count.length === self.level.riddles) { // Victory!
									self.container.removeChild(self.rectangle);
									self.Lock();
									self.level.Victory();
								}
							}

							return true;
						}
					});
				}
			});

			self.grabbed = null;
			self.attached = [];
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
		this.unlocked += 1;
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