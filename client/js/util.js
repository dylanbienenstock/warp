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

PIXI.Sprite.prototype.attach = function(sprite) {
	sprite.x = this.x;
	sprite.y = this.y;
	sprite.rotation = this.rotation;
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