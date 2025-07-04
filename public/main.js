var settings = {
    nodejs:true,
    blinking:true,
    showControls:true,
    randomEmotions:false,
    randomEmotionList:"all",
    clickOnEyes:true,
}
var emotions = {
    list: {}, array: [],
    validate:function(emotion){
        return $.inArray(emotion, this.array) != -1
    },
    default: "base",
    current:"",
    init:function(){
        this.blink.enabled = settings.blinking;
        this.current = this.default;
        this.random.enabled = settings.randomEmotions;
        if(settings.randomEmotionList=="all") this.random.list = this.array;
        else this.random.list = settings.randomEmotionList;


        $("#leftEye g path").each(function(){
            let controlButton = $("<button class='emote'></button>");
            controlButton.attr('data-emotion',$(this).attr("id"))
            controlButton.text($(this).attr("data-button"))
            $("#controls").append(controlButton);
        })
        $("#controls").append($("<button class='hideControls'>hide</button>"))

        this.blink.check()
    },
    blink: {
        check: function () {
            if(settings.blinking)
                this.enabled =  $.inArray(emotions.current, this.list) != -1;
            else
                this.enabled=false
            return this.enabled;
        },
        enabled: true,
        list: ["base"]
    },
    random: {
        enabled: false,
        list: [],
        Get: function () {
            let n = this.list[Math.floor(Math.random() * this.list.length)]
            if (n == emotions.current) {
                return this.Get()
            } else {
                return n;
            }
        }
    }
};
var init = function(){
    if(!settings.showControls) $("#controls").hide();
    emotions.init();

    var rawEmotes = [...document.querySelectorAll("path")];
    rawEmotes.forEach(obj => {
        let id = obj.getAttribute("id");
        emotions.list[id] = { d: obj.getAttribute("d") };
        emotions.array.push(id);
    })
}
init();

if(settings.nodejs){

    // get emote from /API/set/:emotion
    var es = new EventSource('/stream');

    es.onmessage = function (event) {
        let data = JSON.parse(event.data);
        let exp = data.exp || "base";
        changeTo(exp);
    };
}


$('.hideControls').click(function () {
    $('#controls').hide("slow").then().addClass("hidden");
})
if(settings.clickOnEyes){
    $('#leftEye').on("click", function (e) {
        fullscreen()
    })
    $('.inner').on('click', '#rightEye', function (e) {
        changeTo(emotions.random.Get());
    });
}
// Remove all the paths except the first
d3.selectAll("path")
    .filter(function (d, i) { return i; })
    .remove();

d3.select("path")
    .style("display", "block")

let changeTo = function (emotion, eye = 'both') {
    let eyes = { left: ['#leftEye'], right: ['#rightEye'], both: ['#leftEye', '#rightEye'] }
    let e = eyes[eye]||eyes["both"];
    if(!emotions.validate(emotion)) return -1;
    animate(e, emotion)
    return 0;
}

$(".emote").click(function () {
    let emotion = $(this).attr("data-emotion")
    animate(['#leftEye', '#rightEye'], emotion)
})


rightEye = $("#leftEye").clone().attr("id", "rightEye");
$(".inner").append(rightEye)
function animate(selectors, target) {
    var start = emotions.list[emotions.current].d
    end = emotions.list[target].d
    emotions.current = target;
    emotions.blink.check();
    d3
        .select(".inner")
        .selectAll("path")
        .datum({ start, end })
        .transition()
        .duration(1500)
        .ease(d3.easeElasticInOut)
        .attrTween("d", function (d) {
            return flubber.interpolate(d.start, d.end, { maxSegmentLength: 2.1 })
        })
    // .on("end", function() {
    //   sel.call(animate);
    // });
}


let tim = 0;
let cycles = 0;

const t = d3.interval((elapsed) => {
    if (emotions.blink.enabled) {
        if (tim > 70) $('.container:not(.blink)').addClass("blink");
        if (tim <= 5) $('.container.blink').removeClass("blink");//
    }
    tim++
    ti = Math.floor(tim / 2)
    if (ti > 20) e = 20 - (ti - 20)
    else e = ti
    // if(tim<0)tim=1-tim
    // console.log(e);
    maskOpacity(e / 100 + 0.1)
    changeOpacity(e / 120 + 0.1)
    if (tim >= 80) {
        tim = 0;
        cycles++;
        if (cycles % 2 == 0 && emotions.random.enabled) {
            let ran = emotions.random.Get();
            console.log("random", ran)
            changeTo(ran);
        }
    }
}, 150);

function fullscreen() {
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

    var docElm = document.documentElement;
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}
