/**
 * a simple shift cipher that uses a value length key, used to obfuscate the
 * email address.
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
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
/**
 * This is used to hide the email eddress in the text. a simple hack to confuse
 * spammers. better solution would to bind a CAPTCHA to the click event before
 * showing the email. I'm going to see how effective this simple technique is.
 */
var email = "yzdygkc@_j_.kfrilfm"; // my email address :D
var shift_array = [6, 10, 3, 13, 24, 27, 6, 30, 4, 23, // the random key
                   20, 30, 3, 29, 3, 18, 23, 28, 8];

$(function () {
    // initialize all modals
    $('.needs_init_modal').each(function() {
        $(this).modal({
            backdrop: true,
            keyboard: true,
            show: false,
        });
    })
    // transition between two modals, hide the first one and show the second
    .on('click', 'a.show-modal', function() {
        var $parent = $(this).closest('.modal');
        var $modal = $($(this).data('target'));
        $modal.find('.modal-body').load($modal.data('url'), function() {
            $parent.one('hidden.bs.modal', function() {
                $modal.modal('show');
            }).modal('hide');
        })
        return false;
    })
    // submit the contact form
    // @todo show submission errors
    .on('submit', 'form', function() {
        $form = $(this);
        $.post($form.attr('action'), $form.serialize(), function(resp) {
            $form.closest('.modal-body').slideUp(function() {
                $(this).html(resp).slideDown();
            });
        });
        return false;
    });

    // projects modal has it's own navigation that needs to be fixed on scroll
    // this handles the nav. tried to used bootstraps scroll-spy but couldn't
    // get it to work on modals.
    $('#projectsModal').on('shown.bs.modal', function() {
        var $projects_nav = $('#projects_nav');
        var $nav_list = $('#nav_list');
        $('.list-group a').click(function() {
            $projects_nav.animate({
                scrollTop: $($(this).attr('href')).offset().top
            }, 1000);
        });
        $(this).scroll(function() {
            var top = $projects_nav.offset().top;
            if (top > 15) {
                $nav_list.css('top', 0);
            } else if (top >= 0) {
                $nav_list.css('top', 15 - top);
            } else {
                $nav_list.css('top', (-1 * top) + 15);
            }
        });
    });
    
    // reveal the secret email address :D
    $('#contactModal').on('shown.bs.modal', function () {
        $('#reveal_email').click(function() {
            $(this).hide();
            $("#contact_placeholder").html(shift_cipher(email, shift_array))
                .removeClass("hide");
            return false;
        });
    });
});
