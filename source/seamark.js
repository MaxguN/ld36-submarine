function SeaMark(x, y, level, number, location) {
	Animator.call(this, x + 16, y + 16, level.map);
	Collider.call(this, Tags.Seamark, [Tags.Player], new PIXI.Circle(x, y, 64));

	var self = this;

	this.number = number;
	this.location = location;
	this.locked = false;
	this.level = level;
	this.notification = new Animator(x + 16, y + 16 - level.tile.height / 2, level.map);
	this.dialog = new Dialog(level, 'puzzle' + number);

	load.json('animations/seamark.json', function (data) {self.Init(data);});
	load.json('animations/attention.json', function (data) {self.notification.Init(data);});

	this.notification.on('load', function () {
		self.notification.Hide();
	});
}

SeaMark.prototype = Object.create(Animator.prototype);
SeaMark.prototype.constructor = SeaMark;

SeaMark.prototype.SetInteractable = function (enable) {
	if (!this.isInteractable && enable) {
		this.level.SetInteractable(this);
		this.notification.Display();
		this.isInteractable = true;
	} else if (this.isInteractable && !enable) {
		this.isInteractable = false;
		this.notification.Hide();
		this.level.SetInteractable(null);
	}
}

SeaMark.prototype.LaunchDialog = function (callback) {
	this.dialog.on('end', callback);
	this.dialog.Display();
}

SeaMark.prototype.Lock = function () {
	this.SetInteractable(false);
	this.locked = true;
}

SeaMark.prototype.Move = function (x, y) {
	this.x = x + 16;
	this.y = y + 16;

	this.currentAnimation.x = this.x;
	this.currentAnimation.y = this.y;

	this.colliderShape = new PIXI.Circle(x, y, 64);

	this.notification.x = this.x;
	this.notification.y = this.y - level.tile.height / 2;
	this.notification.currentAnimation.x = this.notification.x;
	this.notification.currentAnimation.y = this.notification.y;
}

SeaMark.prototype.Collides = function () {
	function intersectCircles(circle1, circle2) {
		return Math.sqrt(Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2)) < circle1.radius + circle2.radius;
	}

	var colliders = this.level.GetColliders(this.colliderWhitelist);

	if (!colliders.some(function (collider) {
		if (intersectCircles(collider.colliderShape, this.colliderShape)) {
			this.SetInteractable(true);
			return true;
		}
	}, this)) {
		this.SetInteractable(false);
	}
}

SeaMark.prototype.Tick = function (length) {
	if (this.isLoaded && !this.locked) {
		this.Collides()
	}
}