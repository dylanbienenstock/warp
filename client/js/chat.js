window.chatting = false;

var $chat;
var $chatInput;
var $chatContent;
var chatHovering = false;

$(function() {
	$chat = $("#chat");
	$chatInput = $("#chat-input");
	$chatContent = $("#chat-content");

	$chatInput.focusin(function() {
		if (!window.inGame) return;

		window.chatting = true;
		$chat.stop().animate({ opacity: 1 });
	});

	$chatInput.focusout(function() {
		if (!window.inGame) return;

		window.chatting = false;
		$chat.stop().animate({ opacity: 0.4 });
	});

	$chatInput.mouseenter(function() {
		if (!window.inGame) return;

		chatHovering = true;
		$chatInput.focus();
		$chat.stop().animate({ opacity: 1 });
	});

	$chat.mouseleave(function() {
		if (!window.inGame) return;

		chatHovering = false;
		$chatInput.blur();
		$chat.stop().animate({ opacity: 0.4 });
	});

	$chat.mousedown(function(event) {
		if (!window.inGame) return;

		event.preventDefault();
	});

	$chatInput.keydown(function(event) {
		if (!window.inGame) return;

		if (event.which == 13) {
			setTimeout(submitChatMessage, 0);
		}
	});
});

function focusOnChat() {
	if (window.inGame) {
		$chatInput.focus();
	}
}

function submitChatMessage() {
	if (!chatHovering) {
		$chatInput.blur();
	}

	var message = $chatInput.val();
	$chatInput.val("");

	if (message.replace(/\s/g, "").length > 0) {
		sendChatMessage(message);
	} else {
		//$chatInput.blur();
	}
}

function displayChatMessage(name, hue, message) {
	var chatMessageContainer = document.createElement("div");
	chatMessageContainer.className = "chat-message-container";

	var chatMessageName = document.createElement("span");
	chatMessageName.className = "chat-message-name";
	chatMessageName.innerHTML = name + "&nbsp;";

	$(chatMessageName).css({
		color: $.Color().hsla(hue, 0.5, 0.5, 1)
	});

	var chatMessage = document.createElement("span");
	chatMessage.className = "chat-message";
	chatMessage.innerHTML = message;

	chatMessageContainer.appendChild(chatMessageName);
	chatMessageContainer.appendChild(chatMessage);
	document.getElementById("chat-content").appendChild(chatMessageContainer);

	$chatContent.scrollTop($chatContent[0].scrollHeight - $chatContent[0].clientHeight);

	if ($chatContent.children().length > 32) {
		$chatContent.find("div").first().remove();
	}
}