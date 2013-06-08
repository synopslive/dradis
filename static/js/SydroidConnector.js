var SydroidConnector = function (api_key) {
    var lws = null;

    var lastClearCache = 0;

    var variablesCache = {};

    var onupdate = function () {
        console.log("Nothing to do on update :(");
    };

    var jolimodes = {permanent: "Permanent", live: "Live",
        jukebox: "Jukebox"};
    var comments = {permanent: "Flux de musique automatique", live: "Présentement en ondes",
        jukebox: '<strong class="timeleftbeforelive">0:00</strong> restants'};

    var zeroFill = function (number, width) {
        width -= number.toString().length;
        if (width > 0) {
            return new Array(width + (/\./.test(String(number)) ? 2 : 1)).join('0') + number;
        }
        return number;
    };

    var formatLength = function (length) {
        if (length < 0) return "0:00";
        return Math.floor(length / 60.0) + ":" + zeroFill(Math.floor(length % 60), 2);
    };

    var traiteMsg = function (nstatus) {
        if (restartSyTimeout) restartSyTimeout();
        if (nstatus.msgtype && nstatus.msgtype != "status") {
            return;
        }
        $("#osdbox").show();
        var $modesect = $("#modesect");
        $modesect.find(".bigtext").text(jolimodes[nstatus.mode]);
        if (nstatus.mode == "live" && nstatus.timeBeforeLive)
            $modesect.find(".littletext").html('Musique reprise, en cours (<strong class="timeleftbeforelive">0:00</strong>)');
        else
            $modesect.find(".littletext").html(comments[nstatus.mode]);
        $modesect.attr('class', nstatus.mode + 'mode');
        $modesect.find("img").attr('src', '/images/' + nstatus.mode + 'mode.png');

        if (nstatus.mode == "live" && nstatus.timeBeforeLive) {
            $(".ctlbox").not("#ctl-intro").hide();
            $("#ctl-intro").fadeIn("slow");
        }
        else {
            $(".ctlbox").not("#ctl-" + nstatus.mode).hide();
            $("#ctl-" + nstatus.mode).fadeIn("slow");
        }
        if (nstatus.playingMetadatas && (nstatus.playingMetadatas.artist || nstatus.playingMetadatas.title)) {
            $("#nowartist").text(nstatus.playingMetadatas.artist || '(pas d\'auteur)').fadeIn("slow");
            $("#nowtitle").text(nstatus.playingMetadatas.title || '(pas de titre)').fadeIn("slow");
        } else {
            $("#nowartist").fadeOut("slow", function () {
                $(this).text('')
            });
            $("#nowtitle").fadeOut("slow", function () {
                $(this).text('')
            });
        }
        if (nstatus.timeBeforeLive) {
            $(".wrap-time").fadeIn();
            $(".timeleftbeforelive").text(formatLength(nstatus.timeBeforeLive));
            $("#ctl-jukebox .startjukebox").attr("disabled", "disabled").hide();
        } else {
            $(".wrap-time").fadeOut("slow");
            $("#ctl-jukebox .startjukebox").attr("disabled", "").show();
        }
        $(".nbauditeurs").text(nstatus.nbAuditeurs);
        var $switchbed = $(".switchbed");
        if (nstatus.bed == true) {
            if(!$switchbed.is(".bedison")) {
                $switchbed.removeClass("bedisoff").addClass("bedison");
                $switchbed.find("img").attr("src", '/static/images/itson.png')
            }
        } else {
            if(!$switchbed.is(".bedisoff")) {
                $switchbed.removeClass("bedison").addClass("bedisoff");
                $switchbed.find("img").attr("src", '/static/images/itsoff.png')
            }
        }
        if (nstatus.serverTime) {
            var currenttime = new Date(nstatus.serverTime * 1000);
            var $datetimesect = $("#datetimesect");
            $datetimesect.find(".bigtext").text("" + zeroFill(currenttime.getHours().toString(), 2)
                + ":" + zeroFill(currenttime.getMinutes().toString(), 2));
            $datetimesect.find(".littletext").text("" + zeroFill(currenttime.getDate().toString(), 2)
                + "/" + zeroFill((currenttime.getMonth() + 1).toString(), 2)
                + "/" + currenttime.getFullYear().toString());
        }

        if (lastClearCache != nstatus.lastClear) {
            onupdate();
            variablesCache = nstatus.variables;
            lastClearCache = nstatus.lastClear;
        }
    };

    return {
        init: function () {
            var wsaddress = "ws://sycomet.synopslive.net/sydroid";

            if (window.MozWebSocket) {
                lws = new MozWebSocket(wsaddress);
            } else {
                lws = new WebSocket(wsaddress);
            }

            // Set event handlers.
            lws.onopen = function () {
                //$("#ind-comet").addClass('ind-connected').removeClass('ind-disconnected').find("a").html("Connecté");
                console.log("Connecté.");

                this.send("LOGIN=" + api_key)
            };

            lws.onmessage = function (e) {
                // e.data contains received string.
                var parsed = JSON.parse(String(e.data));
                traiteMsg(parsed);
                window.currentSydroidStatus = parsed;
            };

            lws.onclose = function () {
                $("#ind-comet").addClass('ind-disconnected').removeClass('ind-connected').find("a").html("Déconnecté");
            };

            lws.onerror = function () {
                console.error("Une erreur Websocket s'est produite.");
            };
        },
        connectUpdate: function (callback) {
            onupdate = callback;
        },
        send: function (msg, callback) {
            lws.send(msg);
            if (callback) callback();
        }
    };
};
