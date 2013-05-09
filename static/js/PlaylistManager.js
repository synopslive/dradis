var PlaylistManager = function () {
    var wrap = null;
    var rootpath = 'home/synopslive/SLRemoteData/';

    var zeroFill = function (number, width) {
        width -= number.toString().length;
        if (width > 0) {
            return new Array(width + (/\./.test(String(number)) ? 2 : 1)).join('0') + number;
        }
        return number;
    };

    var formatLength = function (length) {
        if (length < 0) return "-0:00";
        return Math.floor(length / 60.0) + ":" + zeroFill(Math.floor(length % 60), 2);
    };


    var showStackElement = function (sE) {
        var cssClasses = 'plelement ';
        var eltaa = "";
        var secondline = "";
        var elinfos = "";
        var actions = "";

        if (sE.status == "ready") {
            actions += '<button data-do-cmd="move ' + sE.id + ' to ' + (sE.position - 1) + '" class="moveup" title="Monter"></button>';
            actions += '<button data-do-cmd="move ' + sE.id + ' to ' + (sE.position + 1) + '" class="movedown" title="Descendre"></button>';
            actions += '<button data-do-cmd="remove ' + sE.id + ' from stack" class="removefromstack" title="Supprimer"></button>';
        }

        if (sE.isAction) {
            cssClasses += "elisaction ";
            cssClasses += "elis-" + sE.action.command.replace(/ /g, "-") + " ";

            if (sE.action.command == "switch to perm")
                eltaa = "Fin de l'émission";
            else if (sE.action.command == "live on")
                eltaa = "Retour à l'antenne";

            eltaa = '<span class="eltitle">' + eltaa + '</span>';
        } else {
            if (!(sE.media)) sE.media = { path: '/home/signez/THIS-IS-A-FAKE.mp3', title: 'MEDIA FANTÔME', artist: 'SUPPRIMEZ-MOI',
                album: '(ce média n\'existe plus.)' };

            if (sE.media.path.search(/Jingle/i) != -1)
                cssClasses += "elisjingle ";
            else if (sE.media.path.search(/Sagas\//i) != -1)
                cssClasses += "elissaga-mp3 ";
            else
                cssClasses += "elismusique ";

            if(sE.media.path.search(/\/Musiques\//) != -1)
                cssClasses += "elisperm ";

            if (sE.media.title && sE.media.artist) {
                eltaa += '<span class="eltitle">' + sE.media.title + '</span>';
                eltaa += ' de <span class="elartist">' + sE.media.artist + '</span>';
            } else {
                eltaa += '<span class="elfilename">' + sE.media.filename + '</span>';
            }

            if (sE.media.album)
                secondline += "(tiré de <em>" + sE.media.album + "</em>)";
            else {
                var pathsplitted = sE.media.path.split("/");
                pathsplitted.pop();
                secondline += "situé dans <em>" + pathsplitted.join("/").replace(rootpath, '');
            }

            elinfos += '<span class="ellength">' + formatLength(sE.media.length) + '</span>';
        }

        if (sE.status == "done")
            cssClasses += "elstisdone ";
        else if (sE.status == "playing")
            cssClasses += "elstisplaying ";
        else if (sE.status == "loaded")
            cssClasses += "elstisloaded ";

        var finalCode = '<div class="' + cssClasses + '">' +
            (elinfos ? ('<p class="w-elinfos">' + elinfos + '</p>') : '') +
            '<p class="w-eltaa">' + eltaa + '</p>' +
            (secondline ? ('<p class="w-secondline">' + secondline + '</p>') : '') +
            (actions ? '<div class="w-actions">' + actions + '</div>' : '') +
            '</div>';

        wrap.append(finalCode);
    }

    return {
        refresh: function () {
            wrap.prepend('<div class="refreshing">Actualisation...</div>');
            $.get("/ajax/currentPlaylist", function (data) {
                wrap.find(".refreshing").remove();
                wrap.find(".plelement").remove();
                var datarray = data;
                if (typeof datarray == 'string' || datarray instanceof String)
                    datarray = JSON.parse(data);
                for (var i = 0; i < datarray.stackElements.length; i++) {
                    showStackElement(datarray.stackElements[i]);
                }
            });
        },

        initialize: function (element) {
            $(element).html('<div class="aplaylist" id="currentplaylist"> </div>');
            wrap = $(element).find("#currentplaylist");
            this.refresh();
        }
    };
};