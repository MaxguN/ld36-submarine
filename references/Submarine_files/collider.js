function Collider(tag, whitelist, shape) {
	this.colliderTag = tag;
	this.colliderWhitelist = whitelist;
	this.colliderShape = shape;
}

var Tags = {
	Player : 'player',
	PlayerBullet : 'player bullet',
	Ennemy : 'ennemy',
	EnnemyBullet : 'ennemy bullet',
	Seamark : 'seamark'
}