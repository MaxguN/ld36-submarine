function Submarine(x, y, level) {
	Animator.call(this, x, y, level.container);
	Collider.call(this, Tags.Player, [
		Tags.Seamark
	]);

	var self = this;

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
	} else if (this.vy === 0) {
		this.vy = -(this.gravity * length);
		this.SwitchToAnim('falling', this.mirrored);
	}

	return delta;
}

Submarine.prototype.Tick = function (length) {
	if (this.isLoaded) {
		var delta = {
			x : 0,
			y : 0
		}

		if (keydown[keys.left]) {
			delta.x -= this.speed * length;
		}

		if (keydown[keys.right]) {
			delta.x += this.speed * length;
		}

		if (keydown[keys.up]) {
			delta.y -= this.speed * length;
		}

		if (keydown[keys.down]) {
			delta.y += this.speed * length;
		}

		// delta = this.Collides(delta, length);

		if (delta.x || delta.y) {
			this.SwitchToAnim('move');
		} else {
			this.SwitchToAnim('idle');
		}

		this.x += delta.x;
		this.y += delta.y;

		this.currentAnimation.position.x = this.x;
		this.currentAnimation.position.y = this.y;

		this.level.UpdateCamera(this.GetCenter());
	}
}