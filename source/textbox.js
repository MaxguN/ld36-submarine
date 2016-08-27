function TextBox(level, pages) {
	this.level = level;

	this.rectangle = new PIXI.Graphics();
	this.container = new PIXI.Container();

	this.pages = [];
	this.index = 0;

	this.listener = function () {};

	this.Init(pages);
}

TextBox.prototype.Init = function (pages) {
	var self = this;

	this.rectangle.beginFill(0x000000, 1);
	this.rectangle.lineStyle(2, 0xcccccc, 1);
	this.rectangle.drawRoundedRect(10, 350, 780, 120, 5);

	this.container.addChild(this.rectangle);

	pages.forEach(function (page) {
		var text = new PIXI.Text(page, {fontFamily : 'Arial', fontSize: 18, fill : 0xDDDDDD, wordWrap : true, wordWrapWidth : 760});
		text.position = new PIXI.Point(20,360);
		this.pages.push(text);
	}, this);

	this.listener = function (event) {
		console.log('listener used')
		if (event.button === 0) {
			if (self.index < self.pages.length - 1) {
				self.NextPage();
			} else if (self.index < self.pages.length) {
				self.Hide();
			}
		} else if (event.button === 2) {
			if (self.index > 0) {
				self.PreviousPage();
			}
		}
	};
}

TextBox.prototype.Reset = function () {
	this.index = 0;

	if (this.pages.length) {
		this.container.addChild(this.pages[this.index]);
	}
}

TextBox.prototype.NextPage = function () {
	this.container.removeChild(this.pages[this.index]);
	this.index += 1;
	this.container.addChild(this.pages[this.index])
}

TextBox.prototype.PreviousPage = function () {
	this.container.removeChild(this.pages[this.index]);
	this.index -= 1;
	this.container.addChild(this.pages[this.index]);
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
	this.container.removeChild(this.pages[this.index]);
}

TextBox.prototype.Display = function () {
	this.Reset();
	this.level.gui.addChild(this.container);
	this.Unlock();
}