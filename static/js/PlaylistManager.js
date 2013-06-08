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


    var showStackElement = function (stackElement) {
        var cssClasses = 'plelement ';
        var mainLine = "";
        var secondLine = "";
        var elinfos = "";
        var actions = "";

        if (stackElement.status == "ready") {
            actions += '<button data-do-cmd="move ' + stackElement.id + ' to ' + (stackElement.position - 1) + '" class="moveup" title="Monter"></button>';
            actions += '<button data-do-cmd="move ' + stackElement.id + ' to ' + (stackElement.position + 1) + '" class="movedown" title="Descendre"></button>';
            actions += '<button data-do-cmd="remove ' + stackElement.id + ' from stack" class="removefromstack" title="Supprimer"></button>';
        }

        if (stackElement.isAction) {
            cssClasses += "elisaction ";
            cssClasses += "elis-" + stackElement.action.command.replace(/ /g, "-") + " ";

            if (stackElement.action.command == "switch to perm")
                mainLine = "Fin de l'émission";
            else if (stackElement.action.command == "live on")
                mainLine = "Retour à l'antenne";

            mainLine = '<span class="eltitle">' + mainLine + '</span>';
        } else {
            if (!(stackElement.media)) {
                stackElement.media = {
                    path: '/home/signez/THIS-IS-A-FAKE.mp3',
                    title: 'MEDIA FANTÔME',
                    artist: 'SUPPRIMEZ-MOI',
                    album: '(ce média n\'existe plus.)'
                };
            }

            if (stackElement.media.path.search(/Jingle/i) != -1)
                cssClasses += "elisjingle ";
            else if (stackElement.media.path.search(/Sagas\//i) != -1)
                cssClasses += "elissaga-mp3 ";
            else
                cssClasses += "elismusique ";

            if(stackElement.media.path.search(/\/Musiques\//) != -1)
                cssClasses += "elisperm ";

            if (stackElement.media.title && stackElement.media.artist) {
                mainLine += '<span class="eltitle">' + stackElement.media.title + '</span>';
                mainLine += ' de <span class="elartist">' + stackElement.media.artist + '</span>';
            } else {
                mainLine += '<span class="elfilename">' + stackElement.media.filename + '</span>';
            }

            mainLine += " <small>" + stackElement.id + " @ " + stackElement.position +  " </small>";

            if (stackElement.media.album)
                secondLine += "(tiré de <em>" + stackElement.media.album + "</em>)";
            else {
                var pathsplitted = stackElement.media.path.split("/");
                pathsplitted.pop();
                secondLine += "situé dans <em>" + pathsplitted.join("/").replace(rootpath, '');
            }

            elinfos += '<span class="ellength">' + formatLength(stackElement.media.length) + '</span>';
        }

        if (stackElement.status == "done")
            cssClasses += "elstisdone ";
        else if (stackElement.status == "playing")
            cssClasses += "elstisplaying ";
        else if (stackElement.status == "loaded")
            cssClasses += "elstisloaded ";

        var finalCode = '<div class="' + cssClasses + '" data-playlist-element-id="' + stackElement.id +
                        '" data-pos="' + stackElement.position + '">' +
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
                    showStackElement(datarray.stackElements[i]);
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
                cursorAt: {
                    top: 50, left: 0
                },
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