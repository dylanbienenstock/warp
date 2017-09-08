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
		this.emptySegments = [];
		this.segments = [];

		this.icon = document.createElement("img");
		this.icon.className = "meter-icon";
		this.icon.src = this.iconURL;
		this.icon.ondragstart = function() { return false; };
		$(this.icon).load(this.layout.bind(this));

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

			$(newSegmentEmpty).css({
				width: $(newSegment).outerWidth(),
				height: $(newSegment).outerHeight()
			});

			this.emptySegments.push(newSegmentEmpty);
			this.segments.push(newSegment);
		}

		this.setValue(this.value);
	}

	layout() {
		for (var i = 0; i < this.segmentCount; i++) {
			var emptySegment = this.emptySegments[i];
			var segment = this.segments[i];

			$(emptySegment).offset($(segment).offset());
		}

		$(this.container).animate({
			opacity: 1
		});
	}

	setValue(value, lerpFactor) {
		lerpFactor = lerpFactor || 1;
		this.value = (1 - lerpFactor) * this.value + lerpFactor * value;

		var segmentValue = this.maxValue / this.segmentCount;
		var fullSegments = Math.floor(this.value / segmentValue);
		var partialSegmentAlpha = Math.min(Math.max((this.value - (segmentValue * fullSegments)) * (1 / segmentValue), 0.01), 0.99);
		var partialSegmentDrawn = false;

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