function getMousePosition() {
	return stageContainer.toLocal(renderer.plugins.interaction.mouse.global);
}

function lerp(v0, v1, t) {
	return (1 - t) * v0 + t * v1;
}

function shortAngleDist(a0,a1) {
    var max = Math.PI*2;
    var da = (a1 - a0) % max;
    return 2*da % max - da;
}

function lerpAngle(a0,a1,t) {
    return a0 + shortAngleDist(a0, a1) * t;
}

PIXI.Sprite.prototype.attach = function(sprite, offsetX, offsetY, offsetRotation) {
	sprite.x = this.x + (offsetX || 0);
	sprite.y = this.y + (offsetY || 0);
	sprite.rotation = this.rotation + (offsetRotation || 0);
}

PIXI.Sprite.prototype.getCenter = function() {
	return {
		x: -Math.cos(this.rotation) * (this.width / 2) * (1 - this.anchor.x) + this.position.x,
		y: -Math.sin(this.rotation) * (this.height / 2) * (1 - this.anchor.y) + this.position.y
	};
}

function cartesianToPolar(x, y) {
	return {
		radius: Math.sqrt(x * x + y * y),
		angle: Math.atan2(y, x)
	};
}

function polarToCartesian(radius, angle) {
	return {
		x: radius * Math.cos(angle),
		y: radius * Math.sin(angle)
	};
}

function rotatePoint(x, y, originX, originY, rotation) {
	return {
    	x: Math.cos(rotation) * (x - originX) - Math.sin(rotation) * (y - originY) + originX,
    	y: Math.sin(rotation) * (x - originX) + Math.cos(rotation) * (y - originY) + originY
	};
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}