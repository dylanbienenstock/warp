class HUDMeter {
	constructor(data) {
		this.containerId = data.containerId;
		this.iconURL = data.iconURL;
		this.color = data.color;
		this.value = data.value;
		this.maxValue = data.maxValue;
		this.segmentCount = data.segmentCount;

		this.container = document.getElementById(this.containerId);
		this.container.className = "meter-container";
		this.segments = [];

		this.icon = document.createElement("img");
		this.icon.className = "meter-icon";
		this.icon.src = this.iconURL;
		this.container.appendChild(this.icon);

		for (var i = 0; i < this.segmentCount; i++) {
			var newSegmentEmpty = document.createElement("div");
			newSegmentEmpty.className = "meter-segment-empty";
			newSegmentEmpty.innerHTML = "&nbsp;";

			var newSegment = document.createElement("div");
			newSegment.className = "meter-segment";
			newSegment.innerHTML = "&nbsp;";
			
			$(newSegment).css({
				backgroundColor: this.color,
				boxShadow: "0px 0px 10px 0px " + this.color
			});

			this.container.appendChild(newSegmentEmpty);
			this.container.appendChild(newSegment);

			$(newSegmentEmpty).offset($(newSegment).offset());
			$(newSegmentEmpty).css({
				width: $(newSegment).outerWidth(),
				height: $(newSegment).outerHeight()
			});

			this.segments.push(newSegment);
		}

		this.setValue(this.value);
	}

	setValue(value, lerpFactor) {
		lerpFactor = lerpFactor || 1;
		this.value = (1 - lerpFactor) * this.value + lerpFactor * value;

		var segmentValue = this.maxValue / this.segmentCount;
		var fullSegments = Math.floor(this.value / segmentValue);
		var partialSegmentAlpha = Math.min(Math.max((this.value - (segmentValue * fullSegments)) * (1 / segmentValue), 0.01), 0.99);
		var partialSegmentDrawn = false;

		console.log(partialSegmentAlpha);

		for (var i = 0; i < this.segmentCount; i++) {
			$(this.segments[i]).css({
				opacity: (i < fullSegments ? 0.99 : (!partialSegmentDrawn ? partialSegmentAlpha : 0.01))
			});

			if (i >= fullSegments) {
				partialSegmentDrawn = true;
			}
		}
	}
}