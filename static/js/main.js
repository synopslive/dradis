// Set URL of your WebSocketMain.swf here:
WEB_SOCKET_SWF_LOCATION = "/bundles/dradis/swf/WebSocketMain.swf";
// Set this to dump debug message from Flash to console.log:
WEB_SOCKET_DEBUG = false;

var sydroidTimeout = null;

function shutdownSydroid() {
}

function restartSyTimeout() {
    if (sydroidTimeout != null) window.clearTimeout(sydroidTimeout);
    sydroidTimeout = window.setTimeout(function () {
        shutdownSydroid();
    }, 2000);
}

$(document).ready(function () {
    $("#osdbox").hide();

    var $body = $("body");

    var wi = WheelIndicator();
    wi.initialize("#notanhorloge");

    var sc = SydroidConnector($body.data("dradis-api-key"));
    sc.init();

    var pm = PlaylistManager();
    pm.initialize("#jukebox .content");

    var lm = LibraryManager();
    lm.initialize(".medias .content");

    var et = EffectsTable();
    et.initialize(".effects-table .content", sc);

    sc.connectUpdate(function () {
        pm.refresh();
        et.refresh();
    });

    $body.on("click", "button", function (event) {
        ckdbut = $(this);
        if (ckdbut.data('do-cmd') && ckdbut.attr('disabled') != "disabled") {
            sc.send(ckdbut.data('do-cmd'), function () {
                ckdbut.blur();
            });
        }
        event.preventDefault();
    });

    $body.on("click", ".switchbed", function (event) {
        if ($(this).is('.bedison')) {
            sc.send("bed off");
        } else {
            sc.send("bed on");
        }
        event.preventDefault();
    });

    var $testinput = $('#testinput');
    $testinput.keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
            sc.send($testinput.val());
            $testinput.val("");
        }
    });

    var prevRecherche = "";
    var timeoutRecherche = null;

    $('#searchinput').keypress(function (event) {
        prevRecherche = $('#searchinput').val();
        if (timeoutRecherche) window.clearTimeout(timeoutRecherche);
        timeoutRecherche = window.setTimeout(function () {
            lm.doSearch($('#searchinput').val().trim());
        }, 200);
    });

    $('.effects-table').hide();
    $body.on('click', '.open-table-effects', function () {
        $('.effects-table').attr('id', 'secondaryview').show();
        $('.medias').removeAttr('id').hide();
    });

    $body.on('click', '.open-medias', function () {
        $('.effects-table').removeAttr('id').hide();
        $('.medias').attr('id', 'secondaryview').show();
    });

    $('#tri').change(function () {
        lm.refresh();
    });

    setTimeout(function () {
        wi.register()
    }, 300);

    setInterval(function () {
        et.refresh()
    }, 1000);

    restartSyTimeout();
});
