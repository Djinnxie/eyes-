var settings = {
    nodejs:true,
    color:0,
    blinking:true,
    showControls:true,
    randomEmotions:false,
    randomEmotionList:"all",
    clickOnEyes:true,
    maskOpacity:100,
    columnOpacity:120,
    blinkInterval:80,
    blinkDuration:[1000,2500],
    blinkPlusMinus:10,
    blinkList:['base'] 
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
        $("#controls").append($("<button class='fullscreen'>fullscreen</button>"))
        $("#controls").append($("<button class='hideControls'>hide</button>"))
        $("#controls").append($("<button class='setColor'>color</button>"))

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

let blink = {
    setDuration:function(){
        let rand = 0;
       if(settings.blinkPlusMinus){
        rand = (Math.random()*(settings.blinkPlusMinus*2))-settings.blinkPlusMinus;
       } 
       this.interval = Math.floor(settings.blinkInterval+rand);
    //    console.log("blink duration",rand,this.interal);
    },
    init:function(){
        this.doCheck();
        this.enabled=settings.blinking;
    //    this.list = settings.blinkList; 
        this.setDuration();
    },
    run:function(on=true){
        data={update:false,
        };
        // console.log(settings.blinkDuration[0],"blink")
        // TODO: fix blink duration
        if(on){ 
            emotion = 'blink'
            data.blink=1;
            data.callback={
                func:function(p){
                    console.log("callback")
                    blink.state=2;
                    blink.run(false);
                },params:{a:"A"}
            }
            data.duration=settings.blinkDuration[0];
        }else{
            data.blink=2;
            emotion=emotions.current
            data.duration=settings.blinkDuration[1];
           this.setDuration(); 
        };
        animate(['#leftEye','#rightEye'],emotion,data);
   },
    doCheck: function () {
        if(settings.blinking)
            this.enabled =  $.inArray(emotions.current, this.list) != -1;
        else
            this.enabled=false
        return this.enabled;
    },
   step:function(){
    // console.log(this.timer)
    if (!this.enabled) {
        return;
    }
    if (this.timer <= 2 && this.state==0 ){
        this.run(true);
        this.state=1;
    } 
    // if (this.timer >= 2 && this.state==1 ){
    //     this.run(false);
    //     this.state=2;
    // } 
    this.timer++;
   if(this.timer>this.interval){
        this.timer=0;
        this.state=0; 
   } 

   },
   check:function(){

   } ,
   state:0,
   timer:0,
   interval:0,
   enabled:true,
   list:['base']
    
}
var setColor = function(col){
    containerFilter = $(".crt").css("filter").split(" ");
        containerFilter.unshift("hue-rotate("+col+"deg)");
        console.log(containerFilter.join(" "))
        $(".container").css({"filter":containerFilter.join(" ")},1500);

}
var init = function(){
    // innerFilter = ["drop-shadow(rgb(255, 0, 0) 0px 0px 8.35729px)", "blur(0.394661px)"]
    if(!settings.showControls) $("#controls").hide();
    emotions.init();
    blink.init();

    var rawEmotes = [...document.querySelectorAll("path")];
    rawEmotes.forEach(obj => {
        let id = obj.getAttribute("id");
        emotions.list[id] = { d: obj.getAttribute("d") };
        emotions.array.push(id);
    })
    if(settings.color){
        setColor(settings.color)
    }
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
$('.setColor').click(function () {
    setColor(Math.floor(Math.random()*360));
})
$('.fullscreen').click(function () {
    fullscreen();
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
    animate(e, emotion,{duration:2500})
    return 0;
}


$(".emote").click(function () {
    let emotion = $(this).attr("data-emotion")
    // animate(['#leftEye', '#rightEye'], emotion)
    changeTo(emotion)
})


rightEye = $("#leftEye").clone().attr("id", "rightEye");
$(".inner").append(rightEye)
animateDefaults = {
    duration:1500,
    update:true,
    blink:0,
    callback:{func:function(p){console.log("blank")},params:{}}
}
function animate(selectors, target,dat={}) {
    dat = $.extend({},animateDefaults,dat);
    // console.log('>>animate',target,dat)
//     data.dutation=dat.duration||2500;
//     data.update=dat.update||true;
// //    data = dat; 
    // console.log('>>animate',dat)
    var start = emotions.list[emotions.current].d
    end = emotions.list[target].d
    if(dat.update){
        emotions.current = target;
        blink.doCheck();
    }
    let n = dat.callback.params;
   let v = dat.callback.func; 
   if(dat.blink==1){
    // $("#leftEye").delay(500).animate({"margin-right":"0px"},{duration:500,queue:false});
    $(".eye").delay(700).animate({"margin-top":"15px","margin-right":"15px"},{duration:300,queue:false})
    // $(".eye").each(function(){
    // // $(this).animate({"top":"10px"},dat.duration/4)
    // })
   }else if(dat.blink==2){
    // $("#leftEye").animate({"margin-right":"20px"},{duration:100,queue:false})
    $(".eye").animate({"margin-top":"5px","margin-right":"17px"},{duration:200,queue:false,complete:function(){
        $(this).animate({"margin-top":"0px","margin-right":"20px"},{duration:700,queue:false})
    }})
    // $(".eye").animate({"top":"0px"},100);
    
   }
    d3
        .select(".inner")
        .selectAll("path")
        .datum({ start, end })
        .transition()
        .duration(dat.duration)
        .ease(d3.easeElasticInOut)
        .attrTween("d", function (d) {
            return flubber.interpolate(d.start, d.end, { maxSegmentLength: 2.1 })
        })
    .on("end",n => {v(n)});
    //     function() {
    //   sel.call(animate);
    // });
}


let timer = 0;
let cycles = 0;
// let blinkState = 0;
// let blinkTimer=0;


const t = d3.interval(() => {
    blink.step();
    if (false&&blink.enabled) {
        if (blinkTimer <= 2 && blink.state==0 ){
            blink.run(true);
            blink.state=1;
        } 
        if (blink.timer >= 2 && blink.state==1 ){
            blink.run(false);
            blink.state=2;
        } 
    }
    timer++
    // blink.timer++;
    // if(blink.timer>=settings.blinkInterval){
    //     blink.timer=0;
    //     blink.state=0;
        
    // }
    timerDiv = Math.floor(timer / 2)
    if (timerDiv > 20) crtTimer = 20 - (timerDiv - 20)
    else crtTimer = timerDiv
    maskOpacity(crtTimer / settings.maskOpacity + 0.1)
    changeOpacity(crtTimer / settings.columnOpacity + 0.1)
    if (timer >= 80) {
        timer = 0;
        cycles++;
        if (cycles % 2 == 0 && emotions.random.enabled) {
            let ran = emotions.random.Get();
            changeTo(ran);
        }
    }
}, 150);
function wobble(single=false,loop=true){
    console.log('wobble')
    let direction=[Math.floor(Math.random()*4)];
    let dirs = ["left","right","top","bottom"];
    let style = {};
    let ammount = Math.floor(Math.random()*30)+"px";
    if(single) ammount=ammount/2;
    $(dirs).each(function(i){
        let d = dirs[i]
        if(i==direction){
            style[d]=ammount;
        }else{
            style[d]="0px";
        }
    })
   let duration = Math.floor(Math.random()*2500); 
    sel = ".inner";
    if(single) sel = "#leftEye"
    d3.select(sel)
    .transition()
    .duration(4500)
    .styles(style)
    .on("end",duration => {
        wobble(single)
    });
}
wobble();
wobble(true);

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
