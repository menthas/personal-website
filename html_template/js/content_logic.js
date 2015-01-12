function shift_cipher(text, shift_array) {
    var len = text.length;
    if (shift_array.length != len)
        return false;
    var charset = "abcdefghijklmnopqrstuvwxyz.@_-";
    var out = "";
    for (var i=0; i<len; i++) {
        out += charset.charAt(
            (charset.indexOf(text[i]) + shift_array[i]) % charset.length
        );
    }
    return out;
}
var email = "yzdygkc@_j_.kfrilfm";
var shift_array = [6, 10, 3, 13, 24, 27, 6, 30, 4, 23,
                   20, 30, 3, 29, 3, 18, 23, 28, 8];

$(function () {
    $('.needs_init_modal').each(function() {
        $(this).modal({
            backdrop: true,
            keyboard: true,
            show: false,
        });
    });

    $('#projectsModal').modal('show');

    var $projects_nav = $('#projects_nav');
    var $nav_list = $('#nav_list');
    $('.list-group a').click(function() {
        $projects_nav.animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 1000);
    });
    $('#projectsModal').scroll(function() {
        var top = $projects_nav.offset().top;
        if (top > 15) {
            $nav_list.css('top', 0);
        } else if (top >= 0) {
            $nav_list.css('top', 15 - top);
        } else {
            $nav_list.css('top', (-1 * top) + 15);
        }
    })

    $('#reveal_email').click(function() {
        $(this).hide();
        $("#contact_placeholder").html(shift_cipher(email, shift_array))
            .removeClass("hide");
        return false;
    });
});
