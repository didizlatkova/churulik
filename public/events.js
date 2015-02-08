$('#tvit-content').keyup(function(e) {
	if ($('#tvit-button').hasClass('disabled') && this.value.length > 0 && this.value.length <= 140) {
		$('#tvit-button').removeClass('disabled');
	} else if (this.value.length === 0 || this.value.length > 140) {
		$('#tvit-button').addClass('disabled');
	}
});