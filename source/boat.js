function Boat(x, y, level, rotation) {
	Animator.call(this, x + 16, y + 16, level.map);
	Collider.call(this, Tags.Ennemy, [], new PIXI.Circle(x, y, 16));

	var self = this;

	this.rotation = rotation;
	this.speed = 256; // pixels/second
	// this.rateOfFire = 5; // shoots / second

	// this.delayShoot = 1 / this.rateOfFire; // seconds
	// this.timerShoot = 0;

	// this.shotCount = 0;
	// this.shotThreshold = 10;

	this.level = level;

	load.json('animations/boat.json', function (data) {self.Init(data);});
}

Boat.prototype = Object.create(Animator.prototype);
Boat.prototype.constructor = Boat;

Boat.prototype.Collides = function (delta, length) {
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

Boat.prototype.Tick = function (length) {
	if (this.isLoaded) {
		var delta = {
			x : 0,
			y : 0
		};

		this.currentAnimation.rotation = this.rotation;

		delta.x *= this.speed * length;
		delta.y *= this.speed * length;

		delta = this.Collides(delta, length);

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
	}
}