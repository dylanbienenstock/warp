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