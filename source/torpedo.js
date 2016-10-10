function Torpedo(x, y, level, rotation) {
	Animator.call(this, x + 16, y + 16, level.map);
	Collider.call(this, Tags.EnnemyBullet, [], new PIXI.Circle(x, y - 8, 8));
	Trigger.call(this, Tags.EnnemyBullet, [Tags.Player], new PIXI.Circle(x, y - 8, 8));

	var self = this;

	this.speed = 256 * 1.5;
	this.rotation = rotation;

	this.exploding = false;

	this.level = level;

	load.json('animations/torpedo.json', function (data) {self.Init(data);});
}

Torpedo.prototype = Object.create(Animator.prototype);
Torpedo.prototype.constructor = Torpedo;

Torpedo.prototype.Collides = function (delta, length) {
	return false;
}

Torpedo.prototype.Tick = function (length) {
	if (this.isLoaded) {
		var delta = {
			x : Math.sin(this.rotation) * this.speed * length,
			y : -Math.cos(this.rotation) * this.speed * length
		};

		if (this.Collides(delta, length) && !this.exploding) {
			this.exploding = true;
			this.SwitchToAnim('explode');
			this.on('endAnimation', function () {
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
}