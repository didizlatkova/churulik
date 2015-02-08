$('#tvit-content').keyup(function(e) {
	if ($('#tvit-button').hasClass('disabled') && this.value.length > 0) {
		$('#tvit-button').removeClass('disabled');
	} else if (this.value.length === 0) {
		$('#tvit-button').addClass('disabled');
	}
});