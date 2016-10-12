function Boat(x, y, level, rotation) {
	Animator.call(this, x + 16, y + 16, level.map);
	Collider.call(this, Tags.Ennemy, [], new PIXI.Circle(x, y, 16));
	Trigger.call(this, Tags.SightArea, [Tags.Player], new PIXI.Circle(x, y, 200));

	var self = this;

	this.rotation = rotation;
	this.speed = 128; // pixels/second
	this.rateOfFire = 0.5; // shoots / second

	this.delayShoot = 1 / this.rateOfFire; // seconds
	this.timerShoot = 0;

	this.shotCount = 0;
	this.shotThreshold = 2;
	
	this.lives = 1;
	this.exploding = false;

	this.target = null;
	this.tailing = 0;
	this.pursuit = false;
	this.cooldown = 10;

	this.level = level;

	this.sightArea = new PIXI.Graphics();
	this.sightArea.lineStyle(2, 0xcccccc, 1);
	this.sightArea.drawCircle(this.x, this.y, 200);
	this.container.addChild(this.sightArea);

	load.json('animations/boat.json', function (data) {self.Init(data);});
}

Boat.prototype = Object.create(Animator.prototype);
Boat.prototype.constructor = Boat;

Boat.prototype.FindPath = function (target, steps) {
	function manhattan(a, b) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	};

	function coords(c) {
		return function (element) {
			return c.x === element.x && c.y === element.y;
		};
	};

	function getLightest(previous, current) {
		return previous ? current.f < previous.f ? current : previous : current;
	}

	function getAdjacentSquares(parent) {
		var adjacents = [];

		if (parent.x > 0) {
			if (parent.y > 0) {
				adjacents.push({x : parent.x - 1, y : parent.y - 1});
			}
			adjacents.push({x : parent.x - 1, y : parent.y});
			if (parent.y < this.level.width) {
				adjacents.push({x : parent.x - 1, y : parent.y + 1});				
			}
		}

		if (parent.y > 0) {
			adjacents.push({x : parent.x, y : parent.y - 1});
		}

		if (parent.y < this.level.width) {
			adjacents.push({x : parent.x, y : parent.y + 1});				
		}

		if (parent.x < this.level.height) {
			if (parent.y > 0) {
				adjacents.push({x : parent.x + 1, y : parent.y - 1});
			}
			adjacents.push({x : parent.x + 1, y : parent.y});
			if (parent.y < this.level.width) {
				adjacents.push({x : parent.x + 1, y : parent.y + 1});				
			}
		}

		return adjacents;
	}

	function reachable(square) {
		return !this.level.terrain.some(function (collider) {
			return square.x * this.level.tile.width === collider.x && square.y * this.level.tile.height === collider.y;
		}, this);
	}

	if (!steps) {
		steps = 10000;		
	} else {
		steps *= 4;
	}

	var closed = [];
	var opened = [];
	var adjacents = [];
	var path = [];
	var element;
	var weight = 0;
	var distance = 0;
	var step = 0;
	var end = {
		x : Math.floor(target.x / this.level.tile.width),
		y : Math.floor(target.y / this.level.tile.height)
	}

	element = {
		x : Math.floor(this.x / this.level.tile.width),
		y : Math.floor(this.y / this.level.tile.height),
		parent : null,
		g : weight
	};

	distance = manhattan(element, end);
	element.f = weight + distance;

	opened.push(element);
	
	while (opened.length && !closed.find(coords(end)) && step < steps) {
		element = opened.reduce(getLightest);

		opened.splice(opened.indexOf(element), 1);
		closed.push(element);

		adjacents = getAdjacentSquares(element);

		adjacents.forEach(function (adjacent) {
			if (!closed.find(coords(adjacent)) && reachable(adjacent)) {
				if (opened.find(coords(adjacent))) {
					weight = manhattan(adjacent, element);
					adjacent = opened.find(coords(adjacent));
					
					if (adjacent.g > weight) {
						distance = manhattan(adjacent, end);

						adjacent.parent = element;
						adjacent.f = distance + weight;
						adjacent.g = weight;
					}
				} else {
					weight = manhattan(adjacent, element);
					distance = manhattan(adjacent, end);

					adjacent.parent = element;
					adjacent.f = distance + weight;
					adjacent.g = weight;

					opened.push(adjacent);
				}
			}
		}, this);

		step += 1
	}

	if (step === steps) {
		element = opened.reduce(getLightest).parent;
	} else if (!closed.find(coords(end))) {
		return false;
	} else {
		element = closed.find(coords(end));
	}

	do {
		path.unshift(element);
		element = element.parent;
	} while (element);

	return path;
}

Boat.prototype.Collides = function (delta, length) {
	function intersectCircles(circle1, circle2) {
		return Math.sqrt(Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2)) < circle1.radius + circle2.radius;
	}

	var colliders = this.level.GetColliders(this.triggerWhitelist);

	if (!colliders.some(function (collider) {
		if (!collider.underwater && !collider.exploding && intersectCircles(collider.colliderShape, this.triggerShape)) {
			this.target = collider;

			return true;
		}
	}, this) && this.target && this.target.speed) {
		this.target = {
			x : this.target.x,
			y : this.target.y
		};
		this.cooldown = 10;
	}

	return delta;
}

Boat.prototype.Shoot = function (length) {
	if (this.timerShoot <= 0) {
		var x = this.target.x - this.x;
		var y = this.target.y - this.y;
		var normal = Math.sqrt(x * x + y * y);

		x /= normal;
		y /= normal;
		
		var rotation = Math.PI / 2 - Math.acos(x) * (y ? -Math.sign(y) : 1);

		this.level.AddObject(new Torpedo(this.x, this.y, this.level, rotation, this));
		this.timerShoot = this.delayShoot;
	}
}

Boat.prototype.Hit = function () {
	this.lives -= 1;

	if (this.lives <= 0) {
		this.Kill();
	}
}

Boat.prototype.Kill = function () {
	this.exploding = true;
	this.SwitchToAnim('explode');
	this.on('endAnimation', function () {
		this.Hide();
		this.level.RemoveObject(this);
		this.container.removeChild(this.sightArea);
	}, this);
}

Boat.prototype.Tick = function (length) {
	if (this.isLoaded && !this.exploding) {

		var target = null;
		var delta = {
			x : 0,
			y : 0
		};

		this.Collides();

		if (this.target) {
			if (this.target.underwater) {
				this.target = {
					x : this.target.x,
					y : this.target.y
				}
			}

			this.pursuit = true;
			if (!this.tailing) {
				this.tailing = Math.random() * 100 + 100;
			}

			if (Math.sqrt(Math.pow(this.x - this.target.x, 2) + Math.pow(this.y - this.target.y, 2)) > this.tailing) {
				var path = this.FindPath(this.target, 1);
				
				if (!path || !path[1]) {
					path = this.FindPath(this.target);

					if (path.length < 2) {
						this.target = null;
					}
				}
				
				if (path && path[1]) {
					target = path[1];
				}
			} else if (!this.target.speed) {
				this.target = null;
			} else {
				delta.x = this.target.x - this.x;
				delta.y = this.target.y - this.y;

				var normal = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

				delta.x /= normal;
				delta.y /= normal;

				if (Math.abs(Math.abs(delta.x) - Math.abs(delta.y)) < 0.5) {
					delta.x = Math.sign(delta.x) * diagValue;
					delta.y = Math.sign(delta.y) * diagValue;
				} else {
					if (Math.abs(delta.x) > Math.abs(delta.y)) {
						delta.x = Math.sign(delta.x);
						delta.y = 0;
					} else {
						delta.x = 0;
						delta.y = Math.sign(delta.y);
					}
				}

				this.rotation = Math.PI / 2 - Math.acos(delta.x) * (delta.y ? -Math.sign(delta.y) : 1);

				delta.x = 0;
				delta.y = 0;
			}
		}

		if (target) {
			delta.x = target.x * this.level.tile.width + this.level.tile.width / 2 - this.x;
			delta.y = target.y * this.level.tile.height + this.level.tile.height / 2 - this.y;

			var normal = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

			delta.x /= normal;
			delta.y /= normal;

			if (Math.abs(Math.abs(delta.x) - Math.abs(delta.y)) < 0.5) {
				delta.x = Math.sign(delta.x) * diagValue;
				delta.y = Math.sign(delta.y) * diagValue;
			} else {
				if (Math.abs(delta.x) > Math.abs(delta.y)) {
					delta.x = Math.sign(delta.x);
					delta.y = 0;
				} else {
					delta.x = 0;
					delta.y = Math.sign(delta.y);
				}
			}

			this.rotation = Math.PI / 2 - Math.acos(delta.x) * (delta.y ? -Math.sign(delta.y) : 1);
		}

		this.currentAnimation.rotation = this.rotation;

		delta.x *= this.speed * length;
		delta.y *= this.speed * length;

		if (delta.x || delta.y) {
			this.SwitchToAnim('move');
		} else {
			this.SwitchToAnim('idle');
		}

		this.x += delta.x;
		this.y += delta.y;

		this.currentAnimation.position.x = this.x;
		this.currentAnimation.position.y = this.y;
		this.colliderShape.x = this.x;
		this.colliderShape.y = this.y;
		this.triggerShape.x = this.x;
		this.triggerShape.y = this.y;

		this.timerShoot -= length;

		if (this.target) {
			this.sightArea.clear();
			this.sightArea.lineStyle(2, 0xcccccc, 1);
			this.sightArea.drawCircle(this.x, this.y, 200 * 2);
			this.container.addChild(this.sightArea);

			if (this.target.speed) {
				this.Shoot(length);
			}
		} else if (this.pursuit) {
			if (this.cooldown > 0){
				this.cooldown -= length;
			} else {
				this.cooldown = 10;
				this.pursuit = false;

				this.sightArea.clear();
				this.sightArea.lineStyle(2, 0xcccccc, 1);
				this.sightArea.drawCircle(this.x, this.y, 200);
				this.container.addChild(this.sightArea);
			}
		}


		this.triggerShape.radius = 200 * (this.pursuit ? 2 : 1);
	}

	Animator.prototype.Tick.call(this, length);
}