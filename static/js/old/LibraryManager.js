var LibraryManager = function () {
    var wrap = null;
    var wrapup = null;

    var countAll = 0;
    var from = 0;
    var nbByPages = 40;
    var curPage = 1;
    var search = "";
    var rootpath = 'home/synopslive/media/';

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


    var showPlaylistElement = function (media) {
        var cssClasses = 'plelement ';
        var eltaa = "";
        var secondline = "";
        var elinfos = "";
        var actions = "";

        if (media.path.search(/Jingle/i) != -1)
            cssClasses += "elisjingle ";
        else if (media.path.search(/Sagas\//i) != -1)
            cssClasses += "elissaga-mp3 ";
        else
            cssClasses += "elismusique ";

        if(media.path.search(/\/Musiques\//) != -1)
            cssClasses += "elisperm ";

        if (media.title && media.title.length > 60) media.title = media.title.slice(0, 60) + "...";
        if (media.artist && media.artist.length > 60) media.artist = media.artist.slice(0, 60) + "...";
        if (media.path) {
            var without_root = media.path.replace(rootpath, '');
            if(without_root.length > 60)
                without_root = "..." + without_root.slice(without_root.length - 60);
            var splitted = without_root.split("/");
            splitted.pop();
            media.shownpath = splitted.join("/");
        }

        actions = '<button data-do-cmd="push m:' + media.id + ' to stack" class="pushtostack"></button>';

        if (media.title && media.artist) {
            eltaa += '<span class="eltitle">' + media.title + '</span>';
            eltaa += ' de <span class="elartist">' + media.artist + '</span>';
        } else {
            eltaa += '<span class="elfilename">' + media.filename + '</span>';
        }

        if (media.album)
            secondline += "(tiré de <em>" + media.album + "</em>)";
        else {
            secondline += "situé dans <em>" + media.shownpath + "</em>";
        }

        if(media.path.search(/\/Special\//) != -1) {
            cssClasses += "elisspecial ";

            var showname = media.path.match(/\/Special\/([^\/]+)\//);

            if(showname && showname.length > 1) {
                secondline += ' <span class="showtag">' + showname[1] + '</span>';
            }
        }

        elinfos += '<span class="ellength">' + formatLength(media.length) + '</span>';

        var finalCode = '<div class="' + cssClasses + '">' +
            '<div class="handle"></div>' +
            (elinfos ? ('<p class="w-elinfos">' + elinfos + '</p>') : '') +
            '<p class="w-eltaa">' + eltaa + '</p>' +
            (secondline ? ('<p class="w-secondline">' + secondline + '</p>') : '') +
            (actions ? '<div class="w-actions">' + actions + '</div>' : '') +
        '</div>';

        $(finalCode).appendTo(wrap);
    };

    var appendPagination = function (myself) {
        var totalpages = Math.ceil(countAll / nbByPages);
        var i = 1;

        var pagination = $('<div id="pagination"></div>');

        for (i = 1; i <= totalpages; i++) {
            curI = i;
            $('<a href="#" npage="' + i + '" class="changepage' + (i == curPage ? ' current' : '') +
                '">' + i + '</a>').click(function () {
                    changePageTo($(this).attr("npage"), myself);
                })
                .appendTo(pagination);
        }

        wrap.after(pagination);
    };

    var refresh = function () {
        wrap.prepend('<div class="refreshing">Actualisation...</div>');
        $.get("/ajax/medias?from=" + from + "&nb=" + nbByPages + "&search=" + search +
            "&orderby=" + $("#tri").val(), function (data) {
            wrap.find(".refreshing").remove();
            wrap.find(".plelement").remove();
            wrapup.find("#pagination").remove();
            var datarray = data;
            if (typeof datarray == 'string' || datarray instanceof String)
                datarray = JSON.parse(data);
            for (var i = 0; i < datarray.medias.length; i++) {
                showPlaylistElement(datarray.medias[i]);
            }
            countAll = datarray.countAll;
            appendPagination(this);
        });
    };

    var changePageTo = function (nvpage, myself) {
        from = nbByPages * (nvpage - 1);
        curPage = nvpage;
        refresh();
    };

    return {
        refresh: refresh,

        doSearch: function (recherche) {
            search = recherche;
            changePageTo(1, this);
        },

        initialize: function (element) {
            $(element).html('<div class="aplaylist" id="currentlibrary"> </div>');
            wrap = $(element).find("#currentlibrary");
            wrapup = $(element);
            this.refresh();
        }
    };
};