function Menu(renderer) {
	this.loaded = false;
	this.listeners = {
		ready : []
	};
	this.next = {
		ready : []
	};

	this.renderer = renderer;
	this.container = new PIXI.Container();

	this.screens = {};

	this.Init();
}

Menu.prototype.Init = function (data) {
	// load background
	// create screens (3-4)
	// mainmenu
	var main = new PIXI.Container();
	main.addChild(PIXI.Sprite.fromImage('textures/background.png'));
	var title = new PIXI.Text('Adventure aboard the Narwhal', {fontFamily : 'Arial', fontSize: 32, fill : 0xEEEEEE});
	title.position = new PIXI.Point((800 - title.width) / 2, 50);
	main.addChild(title);
	var button_play = new Button(new PIXI.Text('PLAY', {fontFamily : 'Arial', fontSize: 22, fill : 0xEEEEEE}), 300, 196, 200, 36);
	button_play.AddTo(main);
	var button_controls = new Button(new PIXI.Text('CONTROLS', {fontFamily : 'Arial', fontSize: 22, fill : 0xEEEEEE}), 300, 242, 200, 36);
	button_controls.AddTo(main);
	var button_credits = new Button(new PIXI.Text('CREDITS', {fontFamily : 'Arial', fontSize: 22, fill : 0xEEEEEE}), 300, 288, 200, 36);
	button_credits.AddTo(main);
	// controls
	var controls = new PIXI.Container();
	// images & text
	// backbutton
	// credits
	var credits = new PIXI.Container();
	// text
	// backbutton

	this.screens.main = main;
	this.screens.controls = controls;
	this.screens.credits = credits;

	this.SwitchTo('main');

	// preload all assets ?

	this.loaded = true;
	this.listeners.ready.forEach(function (listener) {
		listener();
	});
	while (this.next.ready.length > 0) {
		(this.next.ready.shift())();
	}
}

Menu.prototype.on = function(event, callback) {
	if (this.listeners[event]) {
		this.listeners[event].push(callback);
	}

	if (this.loaded) {
		callback();		
	}
};

Menu.prototype.ready = function(callback) {
	if (!this.loaded) {
		this.next.ready.push(callback);
	} else {
		callback();
	}
};

Menu.prototype.SwitchTo = function (screen) {
	for (var index in this.screens) {
		this.container.removeChild(this.screens[index]);
		// unbind event listeners
	}

	this.container.addChild(this.screens[screen]);
	// bind event listeners
}

Menu.prototype.Tick = function (length) {
	if (this.loaded) {
 		this.Draw();
	}
}

Menu.prototype.Draw = function () {
	if (this.loaded) {
		this.renderer.render(this.container);
	}
}