var vza = new VzA();
vza.init();
var audio = new AudioLib();
audio.init();

$(function() {
    var $results = $('#results')
    var $result_list = $('#result_list');
    var $search_box = $('#search_box');
    var $pause = $('#pause');
    var $play = $('#play');
    $search_box.dimmed = false;
    var sc_logo = $('#soundcloud_logo').attr('src');


    $('.hidden').hide();
    $('#search_val').keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode != '13')
            return;

        $('#load_img').show();
        $results.slideUp();
        $result_list.empty();
        SC.get('/tracks', { q: $(this).val() }, function(tracks) {
            $('#load_img').fadeOut('slow');
            var item;
            for (var i=0; i<tracks.length; i++) {
                var artwork_url = tracks[i].artwork_url ?
                    tracks[i].artwork_url.replace("large", "t67x67") :
                    sc_logo;
                var title = tracks[i].title.length <= 45 ?
                    tracks[i].title :
                    tracks[i].title.substring(0, 42) + '&#8230;';
                item = $('<li>').append(
                    $('<img/>').attr(
                        'src', artwork_url
                    ).attr('width', 67)
                ).append(
                    $('<h3>').html(title)
                ).append(
                    $('<p>').html(
                        '<b>Duration:</b> '+duration(tracks[i].duration)+
                        '<br/><b>Played:</b>'+ humanReadable(tracks[i].playback_count)+
                        '&nbsp; &nbsp; &nbsp; '+
                        '<b>&#10084;</b> '+humanReadable(tracks[i].favoritings_count)
                    )
                ).addClass('sound_item').data('track-id', tracks[i].id);
                $result_list.append(item);
            }
            $results.slideDown();

        });
    });

    $result_list.on('click', 'li', function() {
        var id = $(this).data('track-id');
        if (!_.isNull(audio.current_track)) {
            audio.current_track.stop();
            vza.reset();
        } else {
            audio.setVisualization(vza);
        }
        audio.startVisualization(id);

        $search_box.dimmed = true;
        $results.slideUp();
        $search_box.fadeTo('slow', 0.1);
        $pause.fadeIn();
    });

    $search_box.hover(function() {
        if ($search_box.dimmed) {
            $search_box.fadeTo('fast', 1, function() {
                $results.slideDown();
            });
            $search_box.dimmed = false;
            $search_box.hovered = true;
        }
    }, function() {
        if ($search_box.hovered) {
            $search_box.dimmed = true;
            $results.slideUp();
            $search_box.fadeTo('slow', 0.1);
        }
    });

    $pause.click(function(event) {
        audio.current_track.stop();
        vza.reset();
        $(this).hide(function() {
            $play.show();
        });
    });

    $play.click(function(event) {
        audio.startVisualization(audio.current_track_id);
        $(this).hide(function() {
            $pause.show();
        });
    });

    var init_track = parseInt(getUrlParameter('track'));
    if (init_track) {
        setTimeout(function() {
            $('#preloaded').fadeOut('fast');
            audio.setVisualization(vza);
            audio.startVisualization(init_track);

            $search_box.dimmed = true;
            $results.slideUp();
            $search_box.fadeTo('slow', 0.1);
            $pause.fadeIn();
        }, 3000);
    } else {
        $('#preloaded span').hide();
        setTimeout(function() {
            $('#preloaded').fadeOut('fast');
        }, 3000);
    }
    
});

function humanReadable(number) {
    if (number < 10000)
        return number;
    else if (number < 999999)
        return Math.round(number / 1000) + 'K';
    else
        return Math.round(number / 1000000) + 'M';
}

function duration(number) {
    var sec = Math.round(number / 1000);
    var minutes = Math.floor(sec / 60);
    var hours = Math.floor(minutes / 60);
    if (minutes > 0)
        sec %= minutes * 60;
    if (hours > 0) {
        minutes %= hours * 60;
        return hours+"h "+minutes+"m "+sec+"s";
    } else
        return minutes+"m "+sec+"s";
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}
