function SeaMark(x, y, level) {
	Animator.call(this, x, y, level.container);
	Collider.call(this, Tags.Seamark, []);

	var self = this;

	this.level = level;

	load.json('animations/seamark.json', function (data) {self.Init(data);});
}

SeaMark.prototype = Object.create(Animator.prototype);
SeaMark.prototype.constructor = SeaMark;

SeaMark.prototype.Collides = function (delta, length) {
	return delta;
}

SeaMark.prototype.Tick = function (length) {
	if (this.isLoaded) {
		
	}
}