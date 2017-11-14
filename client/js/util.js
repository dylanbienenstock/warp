function getMousePosition() {
	return stageContainer.toLocal(renderer.plugins.interaction.mouse.global);
}

function lerp(v0, v1, t) {
	if (Math.abs(v0 - v1) <= 0.01) {
		return v1;
	}

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

function attachSprite(spriteParent, spriteChild, offsetX, offsetY, offsetRotation) {
	spriteChild.x = spriteParent.x + (offsetX || 0);
	spriteChild.y = spriteParent.y + (offsetY || 0);
	spriteChild.rotation = spriteParent.rotation + (offsetRotation || 0);
}

function getSpriteCenter(sprite) {
	return {
		x: -Math.cos(sprite.rotation) * (sprite.width / 2) * (1 - sprite.anchor.x) + sprite.position.x,
		y: -Math.sin(sprite.rotation) * (sprite.height / 2) * (1 - sprite.anchor.y) + sprite.position.y
	};
}

PIXI.Sprite.prototype.attach = function(sprite, offsetX, offsetY, offsetRotation) {
	if (ENT.physicsDebug) {
		console.log("PIXI.Sprite.prototype.attach is deprecated.");
	}

	sprite.x = this.x + (offsetX || 0);
	sprite.y = this.y + (offsetY || 0);
	sprite.rotation = this.rotation + (offsetRotation || 0);
}

PIXI.Sprite.prototype.getCenter = function() {
	if (ENT.physicsDebug) {
		console.log("PIXI.Sprite.prototype.getCenter is deprecated.");
	}

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

function randomFloat(min, max) {
	return Math.random() * (max - min + 1) + min;
}

function formatCredits(number) {
    return replaceZeros(addCommas(number));;
}

function addCommas(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function replaceZeros(number) {
	return number.toString().replace(/0/g, "O");
}

function getLocalPlayerCredits() {
	if (ENT != undefined && ENT.localPlayer != undefined) {
		return ENT.localPlayer.credits;
	}

	return 0;
}

function randomInRange(min, max) {
	return Math.random() * (max - min) + min;
}

function pointIsOnScreen(position) {
	var screenPosition = ENT.stageContainer.toGlobal(position);

	return (screenPosition.x >= 0 &&
			screenPosition.x <= ENT.ww &&
			screenPosition.y >= 0 &&
			screenPosition.y <= ENT.wh);
}

function createCreditsCollectText(amount, position) {
	var collectText = document.createElement("span");
	collectText.className = "collect-credits";
	collectText.innerHTML = (amount > 0 ? "+" : "") + formatCredits(amount) + " credits";

	document.body.appendChild(collectText);

	$(collectText).offset({
		left: position.x - $(collectText).outerWidth() / 2,
		top: position.y - $(collectText).outerHeight() / 2
	});

	collectText.className = "collect-credits collect-credits-transition";

	setTimeout(function() {
		$(collectText).remove();
	}, 750);
}