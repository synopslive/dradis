window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 30);
        };
})();

var WheelIndicator = function () {
    var myOSD = null;
    var canvas = null;
    var size = 38;
    var cwidth = 12;
    var balls = 1.0;
    var shadows = 1.0;

    var paint = function () {
        if (!window.currentSydroidStatus)
            return;

        var currentTime = window.currentSydroidStatus.timeBeforeLive;
        var totalTime = window.currentSydroidStatus.maxTimeBeforeLive;
        var status = window.currentSydroidStatus.mode;

        canvas.clearRect(0, 0, size + 4, size + 4);

        var nowdate = new Date();
        var nowsec = nowdate.getTime() / 1000.0;

        var angleFin = Math.PI * 2;

        lingradBlack = canvas.createLinearGradient(0, 0, 0, size);
        lingradBlack.addColorStop(0, '#222');
        lingradBlack.addColorStop(0.6, '#444');
        lingradBlack.addColorStop(1, '#666');

        lingradRed = canvas.createLinearGradient(0, 0, 0, size);
        lingradRed.addColorStop(0, '#400');
        lingradRed.addColorStop(0.6, '#622');
        lingradRed.addColorStop(1, '#944');

        if (status == "permanent" || status == "live") {
            canvas.globalCompositeOperation = "source-over";

            // Cercle noir
            if (status == "permanent")
                canvas.fillStyle = lingradBlack;
            else
                canvas.fillStyle = lingradRed;

            canvas.shadowOffsetX = 1;
            canvas.shadowOffsetY = 1;
            canvas.shadowBlur = 1;
            canvas.shadowColor = "rgba(0, 0, 0, 0.5)";

            canvas.beginPath();
            canvas.arc(size / 2, size / 2, size / 2 - 1, angleFin * 0.75, angleFin * 0.751, true);
            canvas.arc(size / 2, size / 2, size / 2 - 1 - cwidth, angleFin * 0.751, angleFin * 0.75, false);
            canvas.fill();

            var couleur = "200, 200, 200";

            /*if(status == "live")
             couleur = "150, 0, 0";*/

            for (i = 0; i < balls; i++) {
                for (j = 1; j < shadows + 1; j++) {
                    var boulePositionX = Math.cos(angleFin * ((nowsec % 5.0) / 5.0 + (1 / balls) * i) + 0.07 * (j - 1)) * (size / 2 - cwidth / 2 - 1) + size / 2;
                    var boulePositionY = Math.sin(angleFin * ((nowsec % 5.0) / 5.0 + (1 / balls) * i) + 0.07 * (j - 1)) * (size / 2 - cwidth / 2 - 1) + size / 2;

                    canvas.fillStyle = "rgba(" + couleur + ", " + (j / shadows) + ")";
                    canvas.strokeStyle = "rgba(" + couleur + ", " + (j / shadows) + ")";

                    canvas.beginPath();
                    canvas.arc(boulePositionX, boulePositionY, cwidth / 2 - 2, 0, angleFin, true);
                    canvas.fill();
                    //canvas.stroke();
                }
            }

            canvas.shadowOffsetX = canvas.shadowOffsetY = canvas.shadowBlur = 0;
            canvas.shadowColor = "transparent";
        } else if (status == "jukebox") {
            var ratio = (totalTime - currentTime) / totalTime;

            if (currentTime >= 13) {
                // Cercle over
                if (ratio > 0.75)
                    canvas.fillStyle = "rgba(115,0,0,1)";
                else if (ratio > 0.5)
                    canvas.fillStyle = "rgba(115,115,0,1)";
                else
                    canvas.fillStyle = "rgba(0,115,0,1)";
                canvas.beginPath();
                canvas.arc(size / 2, size / 2, size / 2 - 3, angleFin * 0.75, angleFin * (0.75 + ratio), true);
                canvas.arc(size / 2, size / 2, size / 2 - 1 - cwidth + 2, angleFin * (0.75 + ratio), angleFin * 0.75, false);
                canvas.fill();
            } else {
                // Cercle over
                canvas.fillStyle = "rgba(150,0,0,1)";

                var i = 12;

                while (i >= 1) {
                    if (i < currentTime) {
                        var currAngle = angleFin * (0.75 + (i - 1) * (-1 / 12));
                        var prevAngle = angleFin * (0.75 + i * (-1 / 12) + 0.015);
                        canvas.beginPath();
                        canvas.arc(size / 2, size / 2, size / 2 - 3, prevAngle, currAngle, false);
                        canvas.arc(size / 2, size / 2, size / 2 - 1 - cwidth + 2, currAngle, prevAngle, true);
                        canvas.fill();
                    }
                    i--;
                }
            }

            // Cercle noir
            canvas.strokeStyle = "rgba(0,0,0,0.2)";
            canvas.fillStyle = "rgba(0,0,0,0.1)";

            canvas.beginPath();
            canvas.arc(size / 2, size / 2, size / 2 - 1, angleFin * 0.75, angleFin * 0.751, true);
            canvas.arc(size / 2, size / 2, size / 2 - 1 - cwidth, angleFin * 0.751, angleFin * 0.75, false);
            canvas.fill();
            canvas.stroke();
        }
    };

    var tour = 0;

    var loop = function () {
        tour += 1;
        if (tour > 2) {
            paint();
            tour = 0;
        }
        window.requestAnimFrame(function () {
            loop()
        });
    };

    return {
        initialize: function (element) {
            if (!($(element)[0].getContext))
                throw new Error("Hey, le browser ne supporte pas le <canvas> !");

            canvas = $(element)[0].getContext('2d');
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