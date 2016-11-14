function Preloader(renderer) {
	this.loaded = false;
	this.listeners = {
		ready : []
	};
	this.next = {
		ready : []
	};

	this.assets = [
		'attention.png',
		'background.png',
		'boat.png',
		'ground_terrain.png',
		'island_terrain.png',
		'notify.png',
		'sea.png',
		'seamark.png',
		'submarine.png',
		'torpedo.png',
		'tutorial.png',
		'Characters/admiral.png',
		'Characters/captain.png',
		'Characters/commander.png',
		'Characters/communication_officer.png',
		'Characters/thule.png',
		'icons/air.png',
		'icons/energy.png',
		'Sextant/bigmirror.png',
		'Sextant/frame.png',
		'Sextant/handle.png',
		'Sextant/lever.png',
		'Sextant/limb.png',
		'Sextant/scope.png',
		'Sextant/smallmirror.png'
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

	var assetCount = this.assets.length;

	this.assets.forEach(function (asset) {
		load.image('textures/' + asset, function () {
			assetCount -= 1

			if (assetCount === 0) {
				self.loaded = true;
				self.listeners.ready.forEach(function (listener) {
					listener();
				});
				while (self.next.ready.length > 0) {
					(self.next.ready.shift())();
				}
			}
		});
	}, this);
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