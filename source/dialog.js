function Dialog(level, file, dialog) {
	var self = this;
	this.fontSize = 18;
	this.choicePadding = 3;
	this.choiceHeight = 26;
	this.choiceSpace = 5;

	this.level = level;
	this.file = file;

	this.textbox;
	this.choices = new PIXI.Container();
	this.listener = function () {};

	this.listeners = {
		end : [],
		answer : []
	}

	load.json('dialogs/' + file + '.json', function (data) {self.Init(data, dialog);});
}

Dialog.prototype.Init = function (data, dialog) {
	var self = this;
	if (!dialog) {
		dialog = data.entrypoint;
	}
	this.textbox = new TextBox(this.level, data[dialog].dialog);

	if (data[dialog].choices) {
		var height = data[dialog].choices.length * this.choiceHeight + (data[dialog].choices.length - 1) * this.choiceSpace;
		var width = 400;
		var top = (350 - height) / 2;
		var left = (800 - width) / 2;
		var rectangles = [];

		var graph = new PIXI.Graphics();
		this.choices.addChild(graph);

		graph.beginFill(0x000000, 1);

		data[dialog].choices.forEach(function (choice, index) {
			var choiceTop = top + index * (this.choiceHeight + this.choiceSpace);
			var text = new PIXI.Text(choice, {fontFamily : 'Arial', fontSize: 18, align : 'center', fill : 0xDDDDDD});
			
			text.position = new PIXI.Point((800 - text.width) / 2, choiceTop + this.choicePadding);
			graph.drawRect(left, choiceTop, width, this.choiceHeight);
			rectangles.push(new PIXI.Rectangle(left, choiceTop, width, this.choiceHeight));

			this.choices.addChild(text);
		}, this);

		this.listener = function (event) {
			if (event.button === 0) {
				rectangles.some(function (rectangle, index) {
					if (rectangle.contains(event.layerX, event.layerY)) {
						if (data[dialog].followup[index].dialog) {
							var followup = new Dialog(self.level, self.file, data[dialog].followup[index].dialog);
							followup.on('end', function () {
								self.end(data[dialog].followup[index].result);
							})
							self.Hide();
							self.answered();
							followup.Display();
						} else {
							self.Hide();
							self.answered();
							self.end(data[dialog].followup[index].result);
						}

						return true;
					}
				});
			}
		}

		this.textbox.on('end', function () {
			self.textbox.Lock();
			self.level.gui.addChild(self.choices);
			self.Unlock();
		});
	} else {
		this.textbox.on('end', function () {
			self.end();
		});
	}

	if (this.file === 'introduction') {
		this.Display();
	}
}

Dialog.prototype.on = function (event, callback) {
	if (this.listeners[event]) {
		this.listeners[event].push(callback);
	}
}

Dialog.prototype.end = function (success) {
	if (this.listeners.end.length) {
		this.listeners.end.forEach(function (callback) {
			callback(success);
		});

		this.listeners.end = [];
	}
	
	this.Hide();
}

Dialog.prototype.answered = function () {
	if (this.listeners.answer.length) {
		this.listeners.answer.forEach(function (callback) {
			callback();
		});

		this.listeners.answer = [];
	}
}

Dialog.prototype.Hide = function () {
	this.Lock();
	this.level.gui.removeChild(this.choices);
	this.textbox.Hide();
}
Dialog.prototype.Display = function () {
	this.textbox.Display();
}

Dialog.prototype.Unlock = function () {
	mouse.on('click', this.listener);
}

Dialog.prototype.Lock = function () {
	mouse.off('click', this.listener);
}