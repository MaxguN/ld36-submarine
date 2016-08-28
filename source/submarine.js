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

	var rectangle = this.GetRectangle();

	var x = rectangle.x + delta.x;
	var y = rectangle.y + delta.y;
	var width = rectangle.width;
	var height = rectangle.height;

	// console.log(x +  ',' + y + ' | ' + width +'x' + height);

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

		delta = this.Collides(delta, length);

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