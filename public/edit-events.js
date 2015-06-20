$(function() {
    if ($('#gender').val() == '') {
        $('#nothing').attr('checked', true);
    } else if ($('#gender').val() == 'мъж') {
        $('#male').attr('checked', true);
    } else if ($('#gender').val() == 'жена') {
        $('#female').attr('checked', true);
    }

});