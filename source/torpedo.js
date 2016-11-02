function Torpedo(x, y, level, rotation, parent) {
	Animator.call(this, x + 16, y + 16, level.dynamic);
	Collider.call(this, Tags.EnnemyBullet, [], new PIXI.Circle(x, y - 8, 8));
	Trigger.call(this, Tags.EnnemyBullet, [Tags.Player, Tags.Seamark, Tags.Ennemy], new PIXI.Circle(x, y - 8, 8));

	var self = this;

	this.speed = 256 * 1.5;
	this.rotation = rotation;

	this.exploding = false;

	this.level = level;
	this.parent = parent;

	load.json('animations/torpedo.json', function (data) {self.Init(data);});
}

Torpedo.prototype = Object.create(Animator.prototype);
Torpedo.prototype.constructor = Torpedo;

Torpedo.prototype.Collides = function (delta, length) {
	function intersectCircles(circle1, circle2) {
		return Math.sqrt(Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2)) < circle1.radius + circle2.radius;
	}

	var colliders = this.level.GetColliders(this.triggerWhitelist);

	if (colliders.some(function (collider) {
		if (collider !== this.parent && intersectCircles(collider.colliderShape, this.triggerShape)) {
			collider.Hit();

			return true;
		}
	}, this)) {
		return true;
	}

	return this.level.Collides(this.triggerShape).collides;
}

Torpedo.prototype.Tick = function (length) {
	if (this.isLoaded && !this.exploding) {
		var delta = {
			x : Math.sin(this.rotation) * this.speed * length,
			y : -Math.cos(this.rotation) * this.speed * length
		};

		if (this.Collides(delta, length)) {
			this.exploding = true;
			this.SwitchToAnim('explode');
			this.on('endAnimation', function () {
				this.Hide();
				this.level.RemoveObject(this);
			}, this);
		}

		this.x += delta.x;
		this.y += delta.y;

		this.currentAnimation.rotation = this.rotation;

		this.currentAnimation.position.x = this.x;
		this.currentAnimation.position.y = this.y;
		this.triggerShape.x = this.x;
		this.triggerShape.y = this.y;

	}

	Animator.prototype.Tick.call(this, length);
}