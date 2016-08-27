function Level(name, renderer) {
	var self = this;

	this.json = {};
	this.window = {
		x : 0,
		y : 0,
		w : 800,
		h : 480
	};

	this.music = new Audio();
	this.tiles = {};
	this.tilesets = [];
	this.layers = [];
	this.colliders = {
		top : [],
		left : [],
		bottom : [],
		right : []
	};
	this.width = 0;
	this.height = 0;
	this.tile = {
		width : 0,
		height : 0
	};

	this.origin = {x:0,y:0};
	this.submarine = {};
	this.end = -1;

	this.objects = {};
	for (var tag in Tags) {
		this.objects[Tags[tag]] = [];
	}

	this.loaded = false;
	this.listeners = {
		ready : [],
		kill : [],
		loose : [],
		win : []
	};
	this.next = {
		ready : [],
		kill : []
	};

	this.ending = false;
	this.over = false;

	this.renderer = renderer;
	this.container = new PIXI.Container();
	this.map = new PIXI.Container();
	this.gui = new PIXI.Container();

	this.gui.position = new PIXI.Point(0,0);
	this.gui.width = this.renderer.width;
	this.gui.height = this.renderer.height;

	this.container.addChild(this.map);
	this.container.addChild(this.gui);

	load.json('levels/' + name + '.json', function (data) {self.Init(data);});
}

Level.prototype.Init = function(level) {
	var self = this;

	var submarineid = -1;
	var seamarkid = -1;

	this.json = level;

	level.tilesets.forEach(function (tileset, index) {
		if (tileset.name === 'Placeholders') {
			submarineid = tileset.firstgid;
			seamarkid = tileset.firstgid + 1;
		} else {
			var uri = tileset.image;
			var texture = new Image();
			texture.src = uri

			this.tilesets[index] = {
				baseTexture : new PIXI.BaseTexture(texture),
				width : tileset.tilewidth,
				height : tileset.tileheight
			};

			for (var i = 0; i < tileset.imageheight; i += tileset.tileheight) {
				for (var j = 0; j < tileset.imagewidth; j += tileset.tilewidth) {
					this.tiles[tileset.firstgid + i / tileset.tileheight * (tileset.imagewidth / tileset.tilewidth) + j / tileset.tilewidth] = {
						x : j,
						y : i,
						set : index,
						texture : new PIXI.Texture(this.tilesets[index].baseTexture, new PIXI.Rectangle(j, i, tileset.tilewidth, tileset.tileheight))
					};
				}
			}
		}
	}, this);

	this.layers = level.layers;
	this.width = level.width;
	this.height = level.height;
	this.tile.width = level.tilewidth;
	this.tile.height = level.tileheight;

	this.layers.forEach(function (layer) {
		if (layer.visible) {
			layer.data.forEach(function (tileid, index) {
				if (tileid > 0) {
					var tile = new PIXI.Sprite(this.tiles[tileid].texture);
					var x = (index % this.width) * this.tile.width;
					var y = Math.floor(index / this.width) * this.tile.height;

					tile.position = new PIXI.Point(x, y);
					this.map.addChild(tile);
				}
			}, this);
		} else {
			if (layer.name === 'Placeholders') {
				layer.data.forEach(function (tileid, index) {
					var x = index % layer.width;
					var y = Math.floor(index / layer.width);

					switch (tileid) {
						case submarineid :
							this.origin.x = x * level.tilewidth;
							this.origin.y = y * level.tileheight;
							this.character = new Submarine(this.origin.x, this.origin.y, this);
							this.AddObject(this.character);
							break;
						case seamarkid :
							this.AddObject(new SeaMark(x * level.tilewidth, y * level.tileheight, this));
							break;
					}
				}, this);
			}
		}
	}, this);

	this.loaded = true;
	this.listeners.ready.forEach(function (listener) {
		listener();
	});
	while (this.next.ready.length > 0) {
		(this.next.ready.shift())();
	}

	var dialog = new Dialog(this, "dialog1");
	dialog.on('end', function (success) {
		console.log(success);
	})
};

Level.prototype.on = function(event, callback) {
	if (this.listeners[event]) {
		this.listeners[event].push(callback);
	}
};

Level.prototype.ready = function(callback) {
	if (!this.loaded) {
		this.next.ready.push(callback);
	} else {
		callback();
	}
};

Level.prototype.loose = function() {
	this.listeners.loose.forEach(function (listener) {
		listener();
	});
};

Level.prototype.win = function() {
	this.listeners.win.forEach(function (listener) {
		listener();
	});
};

Level.prototype.CenterCamera = function (point) {
	this.map.x = -Math.min(Math.max(0, point.x - this.renderer.width / 2), this.map.width - this.renderer.width);
	this.map.y = -Math.min(Math.max(0, point.y - this.renderer.height / 2), this.map.height - this.renderer.height);
}

Level.prototype.UpdateCamera = function(point) {
	var space = 32;

	if (-this.map.x > point.x + space - this.renderer.width / 2) { // left border
		this.map.x = Math.round(-Math.min(Math.max(0, point.x + space - this.renderer.width / 2), this.map.width - this.renderer.width));
	} else if (-this.map.x < point.x - space - this.renderer.width / 2) { // right border
		this.map.x = Math.round(-Math.min(Math.max(0, point.x - space - this.renderer.width / 2), this.map.width - this.renderer.width));
	}
 	
	this.map.y = Math.round(-Math.min(Math.max(0, point.y - this.renderer.height / 2), this.map.height - this.renderer.height));
};

Level.prototype.Collides = function(rectangle) {
	function intersectRectangles(rectangle1, rectangle2) {
		var r1 = {
			left : rectangle1.x,
			right : rectangle1.x + rectangle1.width,
			top : rectangle1.y,
			bottom : rectangle1.y + rectangle1.height
		};
		var r2 = {
			left : rectangle2.x,
			right : rectangle2.x + rectangle2.width,
			top : rectangle2.y,
			bottom : rectangle2.y + rectangle2.height
		};

		return !(r2.left > r1.right || 
				r2.right < r1.left || 
				r2.top > r1.bottom ||
				r2.bottom < r1.top);
	}

	var collides = false;
	var collisions = {
		top : [],
		left : [],
		bottom : [],
		right : []
	};

	for (var way in this.colliders) {
		this.colliders[way].forEach(function (collider) {
			if (intersectRectangles(rectangle, collider)) {
				collides = true;
				collisions[way].push(collider);
			}
		}, this);
	}

	return {
		collides : collides,
		colliders : collisions
	}
};

Level.prototype.AddObject = function (object) {
	this.objects[object.colliderTag].push(object);
}

Level.prototype.RemoveObject = function (object) {
	for (var i = 0; i < this.objects[object.colliderTag].length; i += 1) {
		if (this.objects[object.colliderTag][i] === object) {
			this.objects[object.colliderTag].splice(i, 1);
			break;
		}
	}
}

Level.prototype.Tick = function(length) {
	if (this.loaded) {
		var deltaTime = PIXI.ticker.shared.elapsedMS / 1000;

		for (var tag in this.objects) {
			this.objects[tag].forEach(function (object) {
				object.Tick(deltaTime);
			}, this);
		}

		this.Draw();
	}
};

Level.prototype.Draw = function() {	
	if (this.loaded) {
		this.renderer.render(this.container);
	}
};