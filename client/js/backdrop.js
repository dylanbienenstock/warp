var backdropStars = 1024;
var backdropSize = 1024;
var backdropTilingSprites = [];
var backdropRatios = [
	8, 16, 32
];

function setupBackdrop(backdropContainer) {
	for (var i = backdropRatios.length - 1; i >= 0; i--) {
		var graphics = new PIXI.Graphics();

		for (var i2 = 0; i2 < backdropStars / backdropRatios.length; i2++) {
			graphics.beginFill(0xFFFFFF, Math.random() * 0.5);
			graphics.drawCircle(backdropSize * Math.random(), backdropSize * Math.random(), 1);
			graphics.endFill();
		}

		var texture = window.renderer.generateTexture(graphics);

		var backdropTilingSprite = new PIXI.extras.TilingSprite(texture, 512, 512)

		backdropContainer.addChild(backdropTilingSprite);
		backdropTilingSprites.push(backdropTilingSprite);
	}
}

function renderBackdrop() {
	var ww = $(window).innerWidth();
	var wh = $(window).innerHeight();

	for (var i = backdropTilingSprites.length - 1; i >= 0; i--) {
		backdropTilingSprites[i].width = ww;
		backdropTilingSprites[i].height = wh;

		backdropTilingSprites[i].tilePosition.x = -ENT.stageContainer.pivot.x / backdropRatios[i];
		backdropTilingSprites[i].tilePosition.y = -ENT.stageContainer.pivot.y / backdropRatios[i]; 
	}
}