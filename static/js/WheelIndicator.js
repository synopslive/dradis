window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 24);
        };
})();

var WheelIndicator = function () {
    var element = null;
    var outerSize = 16;
    var innerSize = 9;

    var paint = function () {
        if (!window.currentSydroidStatus)
            return;

        var $element = $(element);

        var circleContainer = $element.find(".circle-container");
        var fillingArc = $element.find(".filling-arc");
        var magicBowl = $element.find(".magic-bowl");

        var currentTime = window.currentSydroidStatus.timeBeforeLive;
        var totalTime = window.currentSydroidStatus.maxTimeBeforeLive;
        var status = window.currentSydroidStatus.mode;

        var angleFin = Math.PI * 2;

        if (status == "permanent") {
            magicBowl.show();
            fillingArc.hide();

            circleContainer.attr("class", "circle-container perm");

        } else if(status == "live") {
            magicBowl.show();
            fillingArc.hide();

            circleContainer.attr("class", "circle-container live");

        } else if (status == "jukebox") {
            magicBowl.hide();
            fillingArc.show();

            circleContainer.attr("class", "circle-container");

            var ratio = 1 - ((totalTime - currentTime) / totalTime);

            function calculatePoint (cx, cy, radius, angle) {
                return Math.round((cx + Math.sin(angle) * radius) * 100) / 100 + "," + Math.round((cy + Math.cos(angle) * radius) * 100) / 100;
            }

            if (currentTime >= 13) {
                if (ratio > 0.75)
                    fillingArc.css("fill", "rgb(0,115,0)");
                else if (ratio > 0.5) {
                    fillingArc.css("fill", "rgb(115,115,0)");
                } else {
                    fillingArc.css("fill", "rgb(115,0,0)");
                }

                var angle = -1.0 * Math.PI + angleFin * (ratio);

                var outerEndPoint = calculatePoint(19, 19, outerSize, angle);
                var innerEndPoint = calculatePoint(19, 19, innerSize, angle);

                var magicValue = (ratio > 0.5) ? "1,0" : "0,0";

                // x y radius startAngle endAngle anticlockwise
                var str = "M 19,19 " +
                          "L 19,3 " + // start point
                          "A 16,16 0 " + magicValue + " " + outerEndPoint + " " + // outer stop
                          "Z " + // back to center
                          "M 19,19 " + // start point
                          "L 19,10 " +
                          "A 9,9 0 " + magicValue + " " + innerEndPoint + " " + // inner stop
                          "Z "; // back to center
                fillingArc.attr("d", str);
                fillingArc.data("ratio", ratio);

            } else {
                // Cercle over
                fillingArc.css("fill", "rgb(115,0,0)");

                var i = 12;

                var str2 = "";

                while (i >= 1) {
                    if (i < currentTime) {
                        var currAngle =  -1.0 * Math.PI + angleFin / 12 * (i - 1);
                        var prevAngle = -1.0 * Math.PI + angleFin / 12 * (i - 0.20);
                        var magicValue2 = "0,1"; //(i > 6) ? "1,1" : "0,1";
                        str2 += "M 19,19 " +
                            "L " + calculatePoint(19, 19, outerSize, prevAngle) + " " + // start point
                            "A 16,16 0 " + magicValue2 + " " + calculatePoint(19, 19, outerSize, currAngle) + " " + // outer stop
                            "Z " + // back to center
                            "M 19,19 " + // start point
                            "L " + calculatePoint(19, 19, innerSize, prevAngle) + " " +
                            "A 9,9 0 " + magicValue2 + " " + calculatePoint(19, 19, innerSize, currAngle) + " " + // inner stop
                            "Z "; // back to center
                        fillingArc.attr("d", str2);
                        fillingArc.data("ratio", ratio);
                    }
                    i--;
                }

                fillingArc.attr("d", str);
                fillingArc.data("ratio", ratio);
            }
        }
    };

    var tour = 0;

    var loop = function () {
        tour += 1;
        if (tour > 5) {
            paint();
            tour = 0;
        }
        window.requestAnimFrame(function () {
            loop()
        });
    };

    return {
        initialize: function (_element) {
            element = _element;
        },
        register: function () {
            paint();
            setTimeout(function () {
                window.requestAnimFrame(function () {
                    loop()
                })
            }, 500);
        }
    };
};