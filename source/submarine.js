function Submarine(x, y, level) {
	Animator.call(this, x, y, level.map);
	Collider.call(this, Tags.Player, [Tags.Seamark], new PIXI.Circle(x + level.tile.width / 2, y + level.tile.height / 2, 16));

	var self = this;

	this.locked = false;

	this.rotation = 0;
	this.speed = 256; // pixels/second
	// this.rateOfFire = 5; // shoots / second

	// this.delayShoot = 1 / this.rateOfFire; // seconds
	// this.timerShoot = 0;

	// this.shotCount = 0;
	// this.shotThreshold = 10;

	this.level = level;

	this.on('load', function () {
		self.level.CenterCamera(self.GetCenter());
	})

	load.json('animations/submarine.json', function (data) {self.Init(data);});
}

Submarine.prototype = Object.create(Animator.prototype);
Submarine.prototype.constructor = Submarine;

Submarine.prototype.Collides = function (delta, length) {
	var collisions;

	var x;
	var y;
	var width = this.currentAnimation.width;
	var height = this.currentAnimation.height;

	if (this.mirrored) {
		x = this.x + delta.x - this.currentAnimation.width;
		y = this.y + delta.y;
	} else {
		x = this.x + delta.x;
		y = this.y + delta.y;
	}

	// console.log(x +  ',' + y + ' | ' + width +'x' + height);

	collisions = this.level.Collides(this.GetRectangle());

	if (collisions.collides) {
		for (var way in collisions.colliders) {
			collisions.colliders[way].forEach(function (collider) {
				var under = (collider.y - (this.y + delta.y + this.currentAnimation.height)) < 0;

				if (way === 'right') {
					if (under && delta.x < 0) { // left
						var dx = (collider.x + collider.width - (this.x - this.currentAnimation.width))

						if (dx > delta.x) {
							delta.x = dx;
						}
					}
				}

				if (way === 'left') {
					if (under && delta.x > 0) { // right
						var dx = collider.x - (this.x + this.currentAnimation.width);

						if (dx < delta.x) {
							delta.x = dx;
						}
					}
				}

				if (way === 'top') {
					if (under && this.vy < 0) {
						var dy = collider.y - (this.y + this.currentAnimation.height);

						if (dy < delta.y) {
							delta.y = dy;
							this.vy = 0;
						}
					}
				}
			}, this);
		}
	}

	return delta;
}

Submarine.prototype.Lock = function () {
	this.locked = true;
}

Submarine.prototype.Unlock = function () {
	this.locked = false;
}

Submarine.prototype.Interact = function () {
	if (this.level.Interact()) {
		this.Lock();
	}
}

Submarine.prototype.Success = function (seamark) {
	console.log('success');
}

Submarine.prototype.Failure = function (seamark) {
	console.log('failure');
}

Submarine.prototype.Tick = function (length) {
	if (this.isLoaded && !this.locked) {
		var delta = GetDirection();
		
		if (IsMoving()) {
			this.rotation = Math.PI / 2 - Math.acos(delta.x) * (delta.y ? -Math.sign(delta.y) : 1);
		}

		this.currentAnimation.rotation = this.rotation;

		delta.x *= this.speed * length;
		delta.y *= this.speed * length;

		// delta = this.Collides(delta, length);

		if (delta.x || delta.y) {
			if (keydown[keys.shift]) {
				this.SwitchToAnim('move-underwater');
			} else {
				this.SwitchToAnim('move');
			}
		} else {
			if (keydown[keys.shift]) {
				this.SwitchToAnim('idle-underwater');
			} else {
				this.SwitchToAnim('idle');
			}
		}

		this.x += delta.x;
		this.y += delta.y;

		this.currentAnimation.position.x = this.x;
		this.currentAnimation.position.y = this.y;
		this.colliderShape.x = this.GetCenter().x;
		this.colliderShape.y = this.GetCenter().y;

		this.level.UpdateCamera(this.GetCenter());

		if (keydown[keys.space]) {
			this.Interact();
		}
	}
}