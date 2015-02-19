if (turk.previewMode) {
	$(".noprev").hide();
	$("#startButton").text('Preview a Trial');
}

function buttonClick() {
	$("#startButton").blur();
	if (!started || turk.previewMode) {
		started = true; window.open('cohen.html');
	} else {
		alert('Please do not do this HIT more than once! If you exited fullscreen due to an error and are trying to start over we are really sorry but we can no longer use your data.');
	}
}