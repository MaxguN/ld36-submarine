function Boat(x, y, level, rotation) {
	Animator.call(this, x + 16, y + 16, level.map);
	Collider.call(this, Tags.Ennemy, [], new PIXI.Circle(x, y, 16));
	Trigger.call(this, Tags.SightArea, [Tags.Player], new PIXI.Circle(x, y, 200));

	var self = this;

	this.rotation = rotation;
	this.speed = 128; // pixels/second
	// this.rateOfFire = 5; // shoots / second

	// this.delayShoot = 1 / this.rateOfFire; // seconds
	// this.timerShoot = 0;

	// this.shotCount = 0;
	// this.shotThreshold = 10;
	this.target = null;

	this.level = level;

	this.sightArea = new PIXI.Graphics();
	this.sightArea.lineStyle(2, 0xcccccc, 1);
	this.sightArea.drawCircle(this.x, this.y, 200);
	this.container.addChild(this.sightArea);

	load.json('animations/boat.json', function (data) {self.Init(data);});
}

Boat.prototype = Object.create(Animator.prototype);
Boat.prototype.constructor = Boat;

Boat.prototype.Collides = function (delta, length) {
	function intersectCircles(circle1, circle2) {
		return Math.sqrt(Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2)) < circle1.radius + circle2.radius;
	}

	var colliders = this.level.GetColliders(this.triggerWhitelist);

	colliders.some(function (collider) {
		if (intersectCircles(collider.colliderShape, this.triggerShape)) {
			this.target = collider;

			return true;
		}
	}, this);

	return delta;
}

Boat.prototype.Tick = function (length) {
	if (this.isLoaded) {
		var delta = {
			x : 0,
			y : 0
		};

		if (this.target) {
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
		}

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
		this.triggerShape.x = this.x;
		this.triggerShape.y = this.y;

		if (this.target) {
			this.sightArea.clear();
			this.sightArea.lineStyle(2, 0xcccccc, 1);
			this.sightArea.drawCircle(this.x, this.y, 200);
			this.container.addChild(this.sightArea);
		}
	}
}