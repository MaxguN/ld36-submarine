function TextBox(level, data) {
	this.level = level;

	this.rectangle = new PIXI.Graphics();
	this.identities = {};
	this.container = new PIXI.Container();
	this.skip = null;

	this.pages = [];
	this.index = 0;

	this.listener = function () {};

	this.listeners = {
		end : []
	}

	this.Init(data);
}

TextBox.prototype.Init = function (data) {
	var self = this;

	this.rectangle.beginFill(0x000000, 1);
	this.rectangle.lineStyle(2, 0xcccccc, 1);
	this.rectangle.drawRoundedRect(10, 350, 780, 120, 5);

	this.container.addChild(this.rectangle);

	data.text.forEach(function (page) {
		var text = new PIXI.Text(page[1], {fontFamily : 'Arial', fontSize: 18, fill : 0xDDDDDD, wordWrap : true, wordWrapWidth : 760});
		text.position = new PIXI.Point(20,360);
		this.pages.push([page[0], text]);
	}, this);

	if (data.characters) {
		data.characters.forEach(function (character) {
			var identity = new PIXI.Container();
			var nametag = new PIXI.Graphics();
			var text = new PIXI.Text(character.name, {fontFamily : 'Arial', fontSize: 18, fill : 0xDDDDDD});
			var side = character.side ? character.side : 'left';
			var portrait;

			var x = side === 'left' ? 15 : 785 - (text.width + 10);

			nametag.beginFill(0x000000, 1);
			nametag.lineStyle(2, 0xcccccc, 1);
			nametag.drawRoundedRect(x, 325, text.width + 10, 30, 5);

			text.position = new PIXI.Point(x + 5, 330);

			if (character.image) {
				portrait = PIXI.Sprite.fromImage('textures/Characters/' + character.image);
				
				if (side === 'left') {
					portrait.scale = new PIXI.Point(0.75,0.75);
				} else {
					x = 790;
					portrait.scale = new PIXI.Point(-0.75,0.75);
				}

				portrait.position = new PIXI.Point(x, 350 - 300);

				identity.addChild(portrait);
			}

			identity.addChild(nametag);
			identity.addChild(text);

			this.identities[character.id] = identity;
		}, this);
	}

	if (this.pages.length > 2) {
		var skip = new PIXI.Graphics();
		var text = new PIXI.Text('Skip', {fontFamily : 'Arial', fontSize: 18, fill : 0xDDDDDD});

		skip.beginFill(0x000000, 1);
		skip.lineStyle(2, 0xcccccc, 1);
		skip.drawRoundedRect(795 - text.width - 10, 445, text.width + 10, 30, 5);

		this.skip = new PIXI.Rectangle(795 - text.width - 10, 445, text.width + 10, 30)

		text.position = new PIXI.Point(790 - text.width, 450);

		this.container.addChild(skip);
		this.container.addChild(text);
	}

	this.listener = function (event) {
		if (event.button === 0) {
			if (self.skip && self.skip.contains(mouse.x, mouse.y)) {
				self.end();
			} else {
				if (self.index < self.pages.length - 1) {
					self.NextPage();
				} else if (self.index < self.pages.length) {
					self.end();
				}
			}

		} else if (event.button === 2) {
			if (self.index > 0) {
				self.PreviousPage();
			}
		}
	};
}

TextBox.prototype.on = function (event, callback) {
	if (this.listeners[event]) {
		this.listeners[event].push(callback);
	}
}

TextBox.prototype.end = function () {
	if (this.listeners.end.length) {
		this.listeners.end.forEach(function (callback) {
			callback();
		});
	} else {
		this.Hide();
	}
}

TextBox.prototype.Reset = function () {
	this.index = 0;

	if (this.pages.length) {
		this.container.addChild(this.pages[this.index][1]);
		if (this.pages[this.index][0]) {
			this.container.addChild(this.identities[this.pages[this.index][0]]);
		}
	}
}

TextBox.prototype.NextPage = function () {
	if (this.pages[this.index][0]) {
		this.container.removeChild(this.identities[this.pages[this.index][0]]);
	}
	this.container.removeChild(this.pages[this.index][1]);
	this.index += 1;
	this.container.addChild(this.pages[this.index][1])
	if (this.pages[this.index][0]) {
		this.container.addChild(this.identities[this.pages[this.index][0]]);
	}
}

TextBox.prototype.PreviousPage = function () {
	if (this.pages[this.index][0]) {
		this.container.removeChild(this.identities[this.pages[this.index][0]]);
	}
	this.container.removeChild(this.pages[this.index][1]);
	this.index -= 1;
	this.container.addChild(this.pages[this.index][1]);
	if (this.pages[this.index][0]) {
		this.container.addChild(this.identities[this.pages[this.index][0]]);
	}
}

TextBox.prototype.Unlock = function () {
	mouse.on('click', this.listener);
}

TextBox.prototype.Lock = function () {
	mouse.off('click', this.listener);
}

TextBox.prototype.Hide = function () {
	this.Lock();
	this.level.gui.removeChild(this.container);
	this.container.removeChild(this.pages[this.index][1]);
	if (this.pages[this.index][0]) {
		this.container.removeChild(this.identities[this.pages[this.index][0]]);
	}
}

TextBox.prototype.Display = function () {
	this.Reset();
	this.level.gui.addChild(this.container);
	this.Unlock();
}