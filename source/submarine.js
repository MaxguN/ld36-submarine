function Submarine(x, y, level) {
	Animator.call(this, x + 16, y + 16, level.map);
	Collider.call(this, Tags.Player, [Tags.Seamark], new PIXI.Circle(x, y, 16));

	var self = this;

	this.locked = false;

	this.rotation = 0;
	this.speed = 256; // pixels/second
	this.speed_surface = this.speed * 0.75; // pixels/second
	this.speed_underwater = this.speed * 1.25; // pixels/second
	this.currentSpeed = this.speed_surface;

	this.diving = false;
	this.underwater = false;
	this.surfacing = false;

	this.energyCapacity = 60;
	this.airCapacity = 5;

	this.energy = this.energyCapacity;
	this.air = this.airCapacity;

	this.dialogs = [];

	this.inventory = new Inventory('sextant', level);

	this.level = level;

	this.on('load', function () {
		this.level.CenterCamera(self.GetCenter());
	}, this)

	this.on('forceSurface', function () {
		console.log('surfacing !')
		this.SwitchToAnim('surface');
		this.surfacing = true;
		this.on('endAnimation', function () {
			console.log('surfaced !')
			this.SwitchToAnim('idle');
			this.surfacing = false;
			this.underwater = false;
			this.currentSpeed = this.speed_surface;
		}, this);
	}, this);

	load.json('animations/submarine.json', function (data) {self.Init(data);});
	this.InitDialogs();
}

Submarine.prototype = Object.create(Animator.prototype);
Submarine.prototype.constructor = Submarine;

Submarine.prototype.InitDialogs = function () {
	var self = this;

	for (var i = 0; i < this.level.riddles; i += 1) {
		this.dialogs.push(new Dialog(this.level, 'part' + i));
		this.dialogs[i].on('end', function () {
			self.Unlock();
		});
	}
}

Submarine.prototype.surface = function () {
	if (this.listeners['forceSurface']) {
		this.listeners['forceSurface'].forEach(function (callback) {
			callback.func.call(callback.object);
		}, this);
	}
}

Submarine.prototype.Collides = function (delta, length) {
	var collisions;

	var rectangle = this.GetRectangle();

	var x = rectangle.x + delta.x;
	var y = rectangle.y + delta.y;
	var width = rectangle.width;
	var height = rectangle.height;

	collisions = this.level.Collides(this.GetRectangle());

	if (collisions.collides) {
		for (var way in collisions.colliders) {
			collisions.colliders[way].forEach(function (collider) {
				var insideTop = collider.y - (y + rectangle.height) < 0;
				var insideBottom = collider.y + collider.height - y > 0;
				var insideLeft = collider.x - (x + rectangle.width) < 0;
				var insideRight = collider.x + collider.width - x > 0;

				if (way === 'right') {
					if (delta.x < 0) { // left
						var dx = collider.x + collider.width - rectangle.x

						if (dx > delta.x) {
							delta.x = dx;
						}
					}
				}

				if (way === 'left') {
					if (delta.x > 0) { // right
						var dx = collider.x - (rectangle.x + rectangle.width);

						if (dx < delta.x) {
							delta.x = dx;
						}
					}
				}

				if (way === 'top') {
					if (delta.y > 0) {
						var dy = collider.y - (rectangle.y + rectangle.height);

						if (dy < delta.y) {
							delta.y = dy;
						}
					}
				}

				if (way === 'bottom') {
					if (delta.y < 0) {
						var dy = collider.y + collider.height - rectangle.y;

						if (dy > delta.y) {
							delta.y = dy;
						}
					}
				}
			}, this);
		}
	}

	return delta;
}

Submarine.prototype.Lock = function (dive) {
	this.locked = true;

	if (dive) {
		if (!this.underwater) {
			this.SwitchToAnim('dive');
			this.diving = true;
			this.on('endAnimation', function () {
				this.SwitchToAnim('idle-underwater');
				this.diving = false;
				this.underwater = true;
				this.currentSpeed = this.speed_underwater;
			}, this);
		}
	}
}

Submarine.prototype.Unlock = function (surface) {
	this.locked = false;
}

Submarine.prototype.Interact = function () {
	if (this.level.Interact()) {
		this.Lock(true);
	}
}

Submarine.prototype.Inventory = function () {
	if (this.inventory.IsOpened()) {
		this.inventory.Hide();
		this.Unlock();
	} else {
		this.Lock();
		this.inventory.Display();
	}
}

Submarine.prototype.Success = function (seamark) {
	if (seamark) {
		this.inventory.ItemUnlock(seamark.number);
		seamark.Lock();
		this.dialogs[this.inventory.unlocked - 1].Display();
		this.Lock();
	}
}

Submarine.prototype.Failure = function (seamark) {
	if (seamark) {
		this.level.RespawnSeamark(seamark);
	}
}

Submarine.prototype.Tick = function (length) {
	if (this.isLoaded) {
		Animator.prototype.Tick.call(this, length);
		if (!this.locked) {
			var delta = GetDirection();
			
			if (IsMoving()) {
				this.rotation = Math.PI / 2 - Math.acos(delta.x) * (delta.y ? -Math.sign(delta.y) : 1);
			}

			if (keydown[keys.shift]) {
				if (!this.diving && !this.surfacing) {
					if (this.underwater) {
						this.SwitchToAnim('surface');
						this.surfacing = true;
						this.on('endAnimation', function () {
							this.SwitchToAnim('idle');
							this.surfacing = false;
							this.underwater = false;
							this.currentSpeed = this.speed_surface;
						}, this);
					} else {
						this.SwitchToAnim('dive');
						this.diving = true;
						this.on('endAnimation', function () {
							this.SwitchToAnim('idle-underwater');
							this.diving = false;
							this.underwater = true;
							this.currentSpeed = this.speed_underwater;
						}, this);
					}

					keydown[keys.shift] = false;
				}
			}

			delta.x *= this.currentSpeed * length;
			delta.y *= this.currentSpeed * length;

			delta = this.Collides(delta, length);

			if (delta.x || delta.y) {
				if (!this.diving && !this.surfacing) {
					if (this.underwater) {
						this.SwitchToAnim('move-underwater');

						this.energy -= length;
						this.air += length;

						if (this.air > this.airCapacity) {
							this.air = this.airCapacity;
						}

						if (this.energy <= 0) {
							this.energy = 0;
							this.surface();
						}
					} else {
						this.SwitchToAnim('move');

						this.energy += length * 2;
						this.air += length * 16;

						if (this.energy > this.energyCapacity) {
							this.energy = this.energyCapacity;
						}
						if (this.air > this.airCapacity) {
							this.air = this.airCapacity;
						}
					}
				}
			} else {
				if (!this.diving && !this.surfacing) {
					if (this.underwater) {
						this.SwitchToAnim('idle-underwater');

						this.air -= length;
						if (this.air <= 0) {
							this.air = 0;
							this.surface();
						}
					} else {
						this.SwitchToAnim('idle');

						this.energy += length * 4;
						this.air += length * 16;

						if (this.energy > this.energyCapacity) {
							this.energy = this.energyCapacity;
						}
						if (this.air > this.airCapacity) {
							this.air = this.airCapacity;
						}
					}
				}
			}

			this.x += delta.x;
			this.y += delta.y;

			this.currentAnimation.rotation = this.rotation;

			this.currentAnimation.position.x = this.x;
			this.currentAnimation.position.y = this.y;
			this.colliderShape.x = this.x;
			this.colliderShape.y = this.y;

			this.level.UpdateCamera(new PIXI.Point(this.x, this.y));

			if (keydown[keys.space]) {
				this.Interact();
				keydown[keys.space] = false;
			}

			if (keydown[keys.i]) {
				this.Inventory();
				keydown[keys.i] = false;
			}
		} else {
			if (this.underwater) {
				this.SwitchToAnim('idle-underwater');

				if (this.air > 0) {
					this.air -= length;
					if (this.air <= 0) {
						this.air = 0;
						this.surface();
					}
				}
			}

			if (keydown[keys.i] && this.inventory.IsOpened()) {
				this.Inventory();
				keydown[keys.i] = false;
			}
		}
	}
}