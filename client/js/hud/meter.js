class HUDMeter {
	constructor(data) {
		this.containerId = data.containerId;
		this.iconURL = data.iconURL;
		this.color = data.color;
		this.value = null;
		this.type = data.type || "segmented"; // "text" | "segmented"
		this.maxValue = data.maxValue;
		this.segmentCount = data.segmentCount;

		this.container = document.getElementById(this.containerId);
		this.container.className = "meter";

		this.icon = document.createElement("img");
		this.icon.className = "meter-icon";
		this.icon.src = this.iconURL;
		this.icon.ondragstart = function() { return false; };
		$(this.icon).load(this.layout.bind(this));

		this.container.appendChild(this.icon);

		if (this.type == "segmented") {
			this.emptySegments = [];
			this.segments = [];

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
		} else if (this.type == "text") {
			this.text = document.createElement("span");
			this.text.className = "meter-text";

			$(this.text).css({
				color: this.color,
				textShadow: "0px 0px 10px " + this.color
			});
			
			this.container.appendChild(this.text);
		}

		this.setValue(this.value);
	}

	layout() {
		if (this.type == "segmented") {
			for (var i = 0; i < this.segmentCount; i++) {
				var emptySegment = this.emptySegments[i];
				var segment = this.segments[i];

				$(emptySegment).offset($(segment).offset());
			}
		} else if (this.type == "text") {
			$(this.text).offset({
				left: $(this.text).offset().left,
				top: $(this.container).offset().top + $(this.container).outerHeight() / 2 - $(this.text).outerHeight() / 2
			});
		}

		$(this.container).animate({
			opacity: 1
		});
	}

	setValue(value, lerpFactor) {
		if (value != this.value) {
			this.value = lerp(this.value, Math.max(value, 0), lerpFactor || 1);

			if (this.type == "segmented") {
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
			} else if (this.type == "text") {
				this.text.innerHTML = formatCredits(Math.round(this.value));
			}
		}
	}
}