var EffectsTable = function () {
    var wrap = null;

    var sc = null;

    var renderSliders = function () {
        if (!window.currentSydroidStatus) return;

        var currentStatus = window.currentSydroidStatus.variables;

        function keys(obj) {
            var keys = [];

            for (var key in obj) {
                keys.push(key);
            }

            return keys;
        }

        var sorted = keys(window.currentSydroidStatus.variables);
        sorted.sort();

        if (wrap.find('input').size() < 1) {
            wrap.html('');


            var yeah = "";

            for (var i = 0; i < sorted.length; i++) {
                var el = sorted[i];
                yeah += "<p>";

                yeah += '<label for="effect-' + el + '">' + el + '</label>';

                if (typeof(window.currentSydroidStatus.variables[el]) == "number") {
                    yeah += '<input type="range" id="effect-' + el + '"';

                    if (window.currentSydroidStatus.variables[el] < 0)
                        yeah += 'min="-30" max="0" step="0.5" ';
                    else if (window.currentSydroidStatus.variables[el] < 2)
                        yeah += 'min="0" max="2" step="0.01" ';
                    else
                        yeah += 'min="0" max="' + Math.max(100, window.currentSydroidStatus.variables[el]) + '" step="0.5" ';

                } else {
                    yeah += '<input type="text" id="effect-' + el + '" ';
                }

                yeah += ' data-previous-value="' + window.currentSydroidStatus.variables[el] + '" ' +
                    ' data-varname="' + el + '" ' +
                    ' name="' + el + '"' +
                    ' value="' + window.currentSydroidStatus.variables[el] + '"  />';

                yeah += '</p>';
            }

            wrap.append(yeah);

            updateShownValue();
        } else {

            for (el in window.currentSydroidStatus.variables) {
                var $el = wrap.find('#effect-' + el);

                if ($el.val() != window.currentSydroidStatus.variables[el] && !$el.is(':focus') &&
                    $el.data('previous-value') == $el.val()) {
                    $el.val(window.currentSydroidStatus.variables[el]);
                    $el.data('previous-value', window.currentSydroidStatus.variables[el]);
                }
            }

        }
    };

    var timeoutChange = null;

    var submit = function () {
        var values = {};

        wrap.find("input").each(function (idx, element) {
            if (element.value != element.getAttribute('data-previous-value'))
                values[element.getAttribute('data-varname')] = element.value;
        });

        for (nom in values) {
            if (values.hasOwnProperty(nom)) {
                if (!isNaN(parseFloat(values[nom]))) {
                    sc.send('change var ' + nom + ' to ' + values[nom]);
                    console.log('change var ' + nom + ' to ' + values[nom]);
                } else {
                    sc.send('switch var ' + nom + ' to ' + values[nom]);
                    console.log('switch var ' + nom + ' to ' + values[nom]);
                }

                wrap.find("input[name=" + nom.replace(/\./g, '\\.') + "]")[0].setAttribute('data-previous-value', values[nom]);
            }
        }
    };

    var rechange = function () {
        if (timeoutChange) window.clearTimeout(timeoutChange);
        timeoutChange = window.setTimeout(submit, 300);
    };

    var updateShownValue = function (element) {
        $("#wrapeffectssliders").find("input[type=range]").each(function (idx, element) {
            $(element).next(".shown-value").remove();
            $(element).after('<span class="shown-value">' + $(element).val() + '</span>');
        });
    };

    return {
        refresh: function () {
            renderSliders();
        },

        initialize: function (element, sydroidconnect) {
            $(element).html('<div id="wrapeffectssliders"> </div>');
            wrap = $(element).find("#wrapeffectssliders");
            wrap.on('change', 'input', rechange);
            wrap.on('change', 'input[type=range]', updateShownValue);
            sc = sydroidconnect;
            this.refresh();
        }
    };
};
