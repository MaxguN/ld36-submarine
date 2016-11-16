function Preloader(renderer) {
	this.loaded = false;
	this.listeners = {
		ready : []
	};
	this.next = {
		ready : []
	};

	this.loader = PIXI.loader;
	this.assets = [
		['attention', 'attention.png'],
		['background', 'background.png'],
		['boat', 'boat.png'],
		['ground_terrain', 'ground_terrain.png'],
		['island_terrain', 'island_terrain.png'],
		['notify', 'notify.png'],
		['sea', 'sea.png'],
		['seamark', 'seamark.png'],
		['submarine', 'submarine.png'],
		['title', 'title.png'],
		['torpedo', 'torpedo.png'],
		['tutorial', 'tutorial.png'],
		['admiral', 'Characters/admiral.png'],
		['captain', 'Characters/captain.png'],
		['commander', 'Characters/commander.png'],
		['communication_officer', 'Characters/communication_officer.png'],
		['thule', 'Characters/thule.png'],
		['air', 'icons/air.png'],
		['energy', 'icons/energy.png'],
		['bigmirror', 'Sextant/bigmirror.png'],
		['frame', 'Sextant/frame.png'],
		['handle', 'Sextant/handle.png'],
		['lever', 'Sextant/lever.png'],
		['limb', 'Sextant/limb.png'],
		['scope', 'Sextant/scope.png'],
		['smallmirror', 'Sextant/smallmirror.png']
	];

	this.renderer = renderer;
	this.container = new PIXI.Container();
	
	var text = new PIXI.Text('Loading...', {fontFamily : 'Arial', fontSize: 36, fill : 0xDDDDDD});
	this.container.addChild(text);
	text.position = new PIXI.Point((this.renderer.width - text.width) / 2, this.renderer.height - text.height - 20);
	// console.log(text)

	this.Init();
}

Preloader.prototype.Init = function (data) {
	var self = this;

	this.assets.forEach(function (asset) {
		this.loader.add(asset[0], 'textures/' + asset[1]);
	}, this);

	this.loader.load();
	this.loader.once('complete', function () {
		self.loaded = true;
		self.listeners.ready.forEach(function (listener) {
			listener();
		});
		while (self.next.ready.length > 0) {
			(self.next.ready.shift())();
		}
	});
}

Preloader.prototype.on = function(event, callback) {
	if (this.listeners[event]) {
		this.listeners[event].push(callback);
	}

	if (this.loaded) {
		callback();		
	}
};

Preloader.prototype.ready = function(callback) {
	if (!this.loaded) {
		this.next.ready.push(callback);
	} else {
		callback();
	}
};

Preloader.prototype.Tick = function (length) {
 	this.Draw();
}

Preloader.prototype.Draw = function () {
	this.renderer.render(this.container);
}