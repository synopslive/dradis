var PlaylistManager = function (sc) {
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


    var showPlaylistElement = function (element) {
        var cssClasses = 'plelement ';
        var mainLine = "";
        var secondLine = "";
        var elinfos = "";
        var actions = "";

        if (element.status == "ready") {
            actions += '<button data-do-cmd="remove ' + element.id + ' from stack" class="removefromstack" title="Supprimer"></button>';
        }

        if (element.isAction) {
            cssClasses += "elisaction ";
            cssClasses += "elis-" + element.action.command.replace(/ /g, "-") + " ";

            if (element.action.command == "switch to perm")
                mainLine = "Fin de l'émission";
            else if (element.action.command == "live on")
                mainLine = "Retour à l'antenne";

            mainLine = '<span class="eltitle">' + mainLine + '</span>';
        } else {
            if (!(element.media)) {
                element.media = {
                    path: '/home/signez/THIS-IS-A-FAKE.mp3',
                    title: 'MEDIA FANTÔME',
                    artist: 'SUPPRIMEZ-MOI',
                    album: '(ce média n\'existe plus.)'
                };
            }

            if (element.media.path.search(/Jingle/i) != -1)
                cssClasses += "elisjingle ";
            else if (element.media.path.search(/Sagas\//i) != -1)
                cssClasses += "elissaga-mp3 ";
            else
                cssClasses += "elismusique ";

            if(element.media.path.search(/\/Musiques\//) != -1)
                cssClasses += "elisperm ";

            if (element.media.title && element.media.artist) {
                mainLine += '<span class="eltitle">' + element.media.title + '</span>';
                mainLine += ' de <span class="elartist">' + element.media.artist + '</span>';
            } else {
                mainLine += '<span class="elfilename">' + element.media.filename + '</span>';
            }

            if (element.media.album)
                secondLine += "(tiré de <em>" + element.media.album + "</em>)";
            else {
                var pathsplitted = element.media.path.split("/");
                pathsplitted.pop();
                secondLine += "situé dans <em>" + pathsplitted.join("/").replace(rootpath, '');
            }

            elinfos += '<span class="ellength">' + formatLength(element.media.length) + '</span>';
        }

        mainLine += " <small class=\"debuginfo\">" + element.id + " @ " + element.position +  " </small>";

        if (element.status == "done")
            cssClasses += "elstisdone ";
        else if (element.status == "playing")
            cssClasses += "elstisplaying ";
        else if (element.status == "loaded")
            cssClasses += "elstisloaded ";

        var finalCode = '<div class="' + cssClasses + '" data-playlist-element-id="' + element.id +
                        '" data-pos="' + element.position + '">' +
            '<div class="handle"></div>' +
            (elinfos ? ('<p class="w-elinfos">' + elinfos + '</p>') : '') +
            '<p class="w-eltaa">' + mainLine + '</p>' +
            (secondLine ? ('<p class="w-secondline">' + secondLine + '</p>') : '') +
            (actions ? '<div class="w-actions">' + actions + '</div>' : '') +
            '</div>';

        wrap.append(finalCode);
    };

    var setAsDirt = function(){
        wrap.sortable("disable");
        wrap.addClass("dirt");
    };

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
                    showPlaylistElement(datarray.stackElements[i]);
                }
                wrap.sortable("enable");
                wrap.sortable("refresh");
                wrap.removeClass("dirt");
            });
        },

        initialize: function (element) {
            $(element).html('<div class="aplaylist" id="currentplaylist"> </div>');
            wrap = $(element).find("#currentplaylist");
            wrap.sortable({
                items : '.plelement:not(.elstisdone):not(.elstisplaying):not(.elisloaded)',
                axis: 'y',
                distance: 5,
                handle: '.handle',
                start: function(event, ui){
                    $(ui.item).attr("data-dirt", "existant")
                        .attr("data-prev-pos", $(ui.item).data("pos"));
                },
                update: function(event, ui){
                    wrap.find(".plelement").each(function(){
                        var $this = $(this);
                        var $prev = $this.prev();
                        var newpos = ($prev.size() ? parseInt($prev.data("pos")) : 0) + 1;

                        if($(this).data("dirt") == "existant") {
                            if(newpos - 1 > $this.data("prev-pos")) {
                                newpos = newpos - 1;
                            }
                        }

                        if(isNaN(newpos)) newpos = 0;
                        if($this.data("new") == "true"){
                            if($prev.is(".controls")){
                                console.log("After controls !");
                                $this.insertBefore($this.prev());
                            }
                            sc.send('insert m:' + $this.data("muid") + ' at ' + newpos);
                            setAsDirt();
                            $this.removeAttr("data-new");
                            $this.removeAttr("data-dirt");
                        } else if($this.data("dirt") == "existant"){
                            if($this.data("prev-pos") != newpos){
                                sc.send('move ' + $this.data("playlist-element-id") + ' to ' + newpos);
                            }
                            setAsDirt();
                            $this.removeAttr("data-dirt");
                        }
                    });
                }
            });
            wrap.bind( "sortchange", function(event, ui) {
                console.log($(ui.item).prev());
            });
            this.refresh();
        }
    };
};