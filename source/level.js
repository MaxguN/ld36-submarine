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
	this.terrain = [];
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
	this.interface = {};
	this.interactable = null;
	this.end = -1;

	this.riddles = 7;
	this.locations = [];
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

	this.victorySpeech = {};
	this.defeatDialog = {};
	this.ending = false;
	this.over = false;

	this.renderer = renderer;
	this.container = new PIXI.Container();
	this.game = new PIXI.Container();
	this.map = new PIXI.Container();
	this.dynamic = new PIXI.Container();
	this.gui = new PIXI.Container();

	this.mapSprite = null;

	this.gui.position = new PIXI.Point(0,0);
	this.gui.width = this.renderer.width;
	this.gui.height = this.renderer.height;

	load.json('levels/' + name + '.json', function (data) {self.Init(data);});
}

Level.prototype.Init = function(level) {
	var self = this;

	var submarineid = -1;
	var seamarkid = -1;
	var boatid = -1;
	var boatProperties = {};
	var islandid = -1;

	this.json = level;

	level.tilesets.forEach(function (tileset, index) {
		if (tileset.name === 'Placeholders') {
			submarineid = tileset.firstgid;
			seamarkid = tileset.firstgid + 1;
			boatid = tileset.firstgid + 4;
			boatProperties = tileset.tileproperties;
		} else {
			if (tileset.name === 'IslandTerrain') {
				islandid = tileset.firstgid;
			}

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

					var rectangle = new PIXI.Rectangle(x, y, this.tile.width, this.tile.height);

					if (tileid >= islandid && tileid <= islandid + 12) {
						this.terrain.push(rectangle);
					}

					switch (tileid) {
						case islandid : // top left
							this.colliders.top.push(rectangle);
							this.colliders.left.push(rectangle);
							break;
						case islandid + 1 : // top
							this.colliders.top.push(rectangle);
							break;
						case islandid + 2 : // top right
							this.colliders.top.push(rectangle);
							this.colliders.right.push(rectangle);
							break;
						case islandid + 3 : // bottom right
							this.colliders.bottom.push(rectangle);
							this.colliders.right.push(rectangle);
							break;
						case islandid + 4 : // bottom left
							this.colliders.bottom.push(rectangle);
							this.colliders.left.push(rectangle);
							break;
						case islandid + 5 : // left
							this.colliders.left.push(rectangle);
							break;
						case islandid + 6 : // none
							break;
						case islandid + 7 : // right
							this.colliders.right.push(rectangle);
							break;
						case islandid + 8 : // top right
							this.colliders.top.push(rectangle);
							this.colliders.right.push(rectangle);
							break;
						case islandid + 9 : // top left
							this.colliders.top.push(rectangle);
							this.colliders.left.push(rectangle);
							break;
						case islandid + 10 : // bottom left
							this.colliders.bottom.push(rectangle);
							this.colliders.left.push(rectangle);
							break;
						case islandid + 11 : // bottom
							this.colliders.bottom.push(rectangle);
							break;
						case islandid + 12 : // bottom right
							this.colliders.bottom.push(rectangle);
							this.colliders.right.push(rectangle);
							break;
					}
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
							this.submarine = new Submarine(this.origin.x, this.origin.y, this);
							this.AddObject(this.submarine);
							break;
						case seamarkid :
							this.locations.push({x : x * level.tilewidth, y : y * level.tileheight, used : false});
							break;
					}

					if (tileid >= boatid) {
						this.AddObject(new Boat(x * level.tilewidth, y * level.tileheight, this, boatProperties[tileid - submarineid].Rotation));
					}
				}, this);
			}
		}
	}, this);

	this.colliders.top.push(new PIXI.Rectangle(-this.tile.width, this.map.height, this.map.width + this.tile.width * 2, this.tile.height));
	this.colliders.left.push(new PIXI.Rectangle(this.map.width, 0, this.tile.width, this.map.height));
	this.colliders.right.push(new PIXI.Rectangle(-this.tile.width, 0, this.tile.width, this.map.height));
	this.colliders.bottom.push(new PIXI.Rectangle(-this.tile.width, -this.tile.height, this.map.width + this.tile.width * 2, this.tile.height));

	for (var i = 0; i < this.riddles; i += 1) {
		var location;
		do {
			location = this.locations[Math.floor(Math.random() * this.locations.length)];
		} while (location.used);

		this.AddObject(new SeaMark(location.x, location.y, this, i, location));
		location.used = true;
	}

	this.loaded = true;
	this.listeners.ready.forEach(function (listener) {
		listener();
	});
	while (this.next.ready.length > 0) {
		(this.next.ready.shift())();
	}

	var mapRenderTexture = PIXI.RenderTexture.create(this.map.width, this.map.height);
	this.renderer.render(this.map, mapRenderTexture);
	this.mapSprite = new PIXI.Sprite(mapRenderTexture);

	// this.game.addChild(this.map);
	this.game.addChild(this.mapSprite);
	this.game.addChild(this.dynamic);
	this.container.addChild(this.game);
	this.container.addChild(this.gui);

	this.interface = new GUI(this);

	this.victorySpeech = new Dialog(this, 'victory');
	this.victorySpeech.on('end', function () {
		currentScene = menu;
		menu.SwitchTo('credits');
	});
	this.defeatDialog = new Dialog(this, 'defeat');
	this.defeatDialog.on('end', function (retry) {
		if (retry) {
			setTimeout(function () { menu.Play(); }, 200);
		} else {
			currentScene = menu;
			menu.SwitchTo('credits');
		}
	});
	var intro = new Dialog(this, 'introduction');
	intro.on('end', function () {
		self.submarine.Unlock();
	});
	this.submarine.Lock();
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

Level.prototype.RespawnSeamark = function (seamark) {
	var location;

	do {
		location = this.locations[Math.floor(Math.random() * this.locations.length)];
	} while (location.used);

	seamark.location.used = false;
	seamark.location = location;

	seamark.Move(location.x, location.y);

	location.used = true;
}

Level.prototype.CenterCamera = function (point) {
	this.game.x = -Math.min(Math.max(0, point.x - this.renderer.width / 2), this.mapSprite.width - this.renderer.width);
	this.game.y = -Math.min(Math.max(0, point.y - this.renderer.height / 2), this.mapSprite.height - this.renderer.height);
}

Level.prototype.UpdateCamera = function(point) {
	var space = 0;

	if (-this.game.x > point.x + space - this.renderer.width / 2) { // left border
		this.game.x = Math.round(-Math.min(Math.max(0, point.x + space - this.renderer.width / 2), this.mapSprite.width - this.renderer.width));
	} else if (-this.game.x < point.x - space - this.renderer.width / 2) { // right border
		this.game.x = Math.round(-Math.min(Math.max(0, point.x - space - this.renderer.width / 2), this.mapSprite.width - this.renderer.width));
	}
 	
	this.game.y = Math.round(-Math.min(Math.max(0, point.y - this.renderer.height / 2), this.mapSprite.height - this.renderer.height));
};

Level.prototype.SetInteractable = function (object) {
	this.interactable = object;
}

Level.prototype.Interact = function () {
	var self = this;

	if (this.interactable) {
		this.interactable.LaunchDialog(function (success) {
			self.submarine.Unlock(true);
			
			if (success) {
				self.submarine.Success(self.interactable);
			} else {
				self.submarine.Failure(self.interactable);
			}
		},
		function () {
			self.submarine.off('forceSurface', self.interactable.Timeout);
			self.submarine.surface();
		});

		this.submarine.on('forceSurface', this.interactable.Timeout, this.interactable);

		return true;
	} else {
		return false;
	}
}

Level.prototype.Victory = function () {
	var self = this;
	this.submarine.Lock();
	setTimeout(function () {self.victorySpeech.Display();}, 1000);
}

Level.prototype.Defeat = function () {
	this.defeatDialog.Display();
}

Level.prototype.Collides = function(shape) {
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

	function intersectSegmentCircle(a, b, c) {
		var ac = Math.sqrt(Math.pow(a.x - c.x, 2) + Math.pow(a.y - c.y, 2));
		var ab = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

		return c.radius >= Math.sqrt(Math.pow(ac, 2) - Math.pow(ab / 2, 2));
	}

	function intersectRectangleCircle(rectangle, circle) {
		var r = {
			left : rectangle.x,
			right : rectangle.x + rectangle.width,
			top : rectangle.y,
			bottom : rectangle.y + rectangle.height
		};
		

		return (rectangle.contains(circle.x, circle.y) ||
				intersectSegmentCircle(new PIXI.Point(r.left, r.top), new PIXI.Point(r.left, r.bottom), circle) ||
				intersectSegmentCircle(new PIXI.Point(r.left, r.bottom), new PIXI.Point(r.right, r.bottom), circle) ||
				intersectSegmentCircle(new PIXI.Point(r.right, r.bottom), new PIXI.Point(r.right, r.top), circle) ||
				intersectSegmentCircle(new PIXI.Point(r.right, r.top), new PIXI.Point(r.left, r.top), circle));
	}

	var collides = false;
	var collisions = {
		top : [],
		left : [],
		bottom : [],
		right : []
	};

	if (shape.type === PIXI.SHAPES.RECT) {
		for (var way in this.colliders) {
			this.colliders[way].forEach(function (collider) {
				if (intersectRectangles(collider, shape)) {
					collides = true;
					collisions[way].push(collider);
				}
			}, this);
		}
	} else if (shape.type === PIXI.SHAPES.CIRC) {
		for (var way in this.colliders) {
			this.colliders[way].forEach(function (collider) {
				if (intersectRectangleCircle(collider, shape)) {
					collides = true;
					collisions[way].push(collider);
				}
			}, this);
		}
	}


	return {
		collides : collides,
		colliders : collisions
	}
};

Level.prototype.PingBoats = function (shape) {
	this.objects[Tags.Ennemy].forEach(function (boat) {
		boat.Ping(shape);
	}, this);
}

Level.prototype.AddObject = function (object) {
	this.objects[object.colliderTag].push(object);

	if (object.triggerTag && object.triggerTag !== object.colliderTag) {
		this.objects[object.triggerTag].push(object);
	}
}

Level.prototype.RemoveObject = function (object) {
	for (var i = 0; i < this.objects[object.colliderTag].length; i += 1) {
		if (this.objects[object.colliderTag][i] === object) {
			this.objects[object.colliderTag].splice(i, 1);
			break;
		}
	}

	if (object.triggerTag && object.triggerTag !== object.colliderTag) {
		for (var i = 0; i < this.objects[object.triggerTag].length; i += 1) {
			if (this.objects[object.triggerTag][i] === object) {
				this.objects[object.triggerTag].splice(i, 1);
				break;
			}
		}
	}
}

Level.prototype.GetObjects = function (tag) {
	if (!this.objects[tag]) {
		return [];
	}

	return this.objects[tag];
}

Level.prototype.GetColliders = function (whitelist) {
	var colliders = [];

	whitelist.forEach(function (tag) {
		colliders = colliders.concat(this.objects[tag]);
	}, this);

	return colliders;
}

Level.prototype.Tick = function(length) {
	if (this.loaded) {
		var deltaTime = PIXI.ticker.shared.elapsedMS / 1000;

		for (var tag in this.objects) {
			this.objects[tag].forEach(function (object) {
				object.Tick(deltaTime);
			}, this);
		}

		this.interface.Tick(deltaTime);

		this.Draw();
	}
};

Level.prototype.Draw = function() {	
	if (this.loaded) {
		this.renderer.render(this.container);
	}
};