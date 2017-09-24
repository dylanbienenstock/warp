var backdropStars = [];
var backdropStarTrailGraphics;
var backdropStarTrailLength = 0;
var backdropStarCount = 1024;
var backdropSize = 1024;
var backdropTilingSprites = [];
var backdropRatios = [
	8, 16, 32
];

function setupBackdrop(backdropContainer) {
	backdropStarTrailGraphics = new PIXI.Graphics();

	for (var i = backdropRatios.length - 1; i >= 0; i--) {
		var graphics = new PIXI.Graphics();
		var stars = [];

		for (var i2 = 0; i2 < backdropStarCount / backdropRatios.length; i2++) {
			var star = {
				alpha: Math.random() * 0.5,
				radius: 1 + Math.random() / 2,
				x: backdropSize * Math.random(), 
				y: backdropSize * Math.random()
			};

			if (star.alpha > 0.1) {
				stars.push(star);

				graphics.beginFill(0xFFFFFF, star.alpha);
				graphics.drawCircle(star.x, star.y, star.radius);
				graphics.endFill();
			}
		}

		var texture = window.renderer.generateTexture(graphics);
		var backdropTilingSprite = new PIXI.extras.TilingSprite(texture, 512, 512)

		backdropContainer.addChild(backdropTilingSprite);
		backdropTilingSprites.push(backdropTilingSprite);
		backdropStars.push(stars);
	}

	backdropContainer.addChild(backdropStarTrailGraphics);
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function renderBackdrop() {
	var ww = $(window).innerWidth();
	var wh = $(window).innerHeight();

	for (var i = backdropTilingSprites.length - 1; i >= 0; i--) {
		backdropTilingSprites[i].alpha = Math.max(0, 1 - backdropStarTrailLength / 10);

		backdropTilingSprites[i].width = ww;
		backdropTilingSprites[i].height = wh;

		backdropTilingSprites[i].tilePosition.x = -ENT.stageContainer.pivot.x / backdropRatios[i];
		backdropTilingSprites[i].tilePosition.y = -ENT.stageContainer.pivot.y / backdropRatios[i];
	}

	backdropStarTrailGraphics.clear();
	backdropStarTrailLength = lerp(backdropStarTrailLength, (window.warping ? 100 : 0), (window.warping ? 0.02 : 0.2));

	if (backdropStarTrailLength > 0.1) {
		renderStarTrails(ww, wh);
	}
}

function renderStarTrails(ww, wh) {
	var angle = Math.atan2(ENT.localPlayer.sprite.y - window.warpPosition.y, ENT.localPlayer.sprite.x - window.warpPosition.x);

	for (var i = 0; i < backdropTilingSprites.length; i++) {
		var backdropTilingSprite = backdropTilingSprites[i];
		var startX = mod(backdropTilingSprites[i].tilePosition.x, 1024);
		var startY = mod(backdropTilingSprites[i].tilePosition.y, 1024);
		var xTiles = 0;
		var yTiles = 0;

		while (startX > 0) {
			startX -= 1024;
		}

		while (startY > 0) {
			startY -= 1024;
		}

		var endX = startX;
		var endY = startY;

		while (endX < ww) {
			endX += 1024;
			xTiles++;
		}

		while (endY < wh) {
			endY += 1024;
			yTiles++;
		}

		var stars = backdropStars[i];

		for (var x = 0; x < xTiles; x++) {
			for (var y = 0; y < yTiles; y++) {
				for (var i2 = 0; i2 < stars.length; i2++) {
					var star = stars[i2];
					var starX = star.x + startX + x * 1024;
					var starY = star.y + startY + y * 1024;


					backdropStarTrailGraphics.lineStyle(star.radius, 0xFFFFFF, star.alpha);
					backdropStarTrailGraphics.moveTo(starX, starY);
					backdropStarTrailGraphics.lineTo(starX + Math.cos(angle) * backdropStarTrailLength,
													 starY + Math.sin(angle) * backdropStarTrailLength);
				}
			}
		}
	}
}