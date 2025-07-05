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
    blinkList:['base'],
    wobble:true,
}
var emotions = {
    list: {}, array: [],
    single:{
        list:{},array:[]
    },
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
            // if($(this).hasClass("single")){
            //     controlButton.addClass("single")
            // }
            if(!$(this).hasClass("single")){
                $("#controls").append(controlButton);
            } 
        })
        $("#controls").append($("<button class='fullscreen'>fullscreen</button>"))
        $("#controls").append($("<button class='hideControls'>hide</button>"))
        $("#controls").append($("<button class='setColor'>color</button>"))
        $("#controls").append($("<button class='single'>join</button>"))

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
        // TODO: fix blink duration
        if(on){ 
            emotion = 'blink'
            data.blink=1;
            data.callback={
                func:function(p){
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
    if (!this.enabled||singleSprite.joined) {
        return;
    }
    if (this.timer <= 2 && this.state==0 ){
        this.run(true);
        this.state=1;
    } 
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
        // console.log(containerFilter.join(" "))
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
        if($(obj).hasClass("single")){
            emotions.single.list[id] = { d: obj.getAttribute("d") };
            emotions.single.array.push(id);
        }else{
            emotions.list[id] = { d: obj.getAttribute("d") };
            emotions.array.push(id);
        }
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

let changeTo = function (emotion, eye = 'both',skipCheck=false) {
    if(singleSprite.joined){
        if(!skipCheck)
            return;
    } 
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
$("button.single").click(function(){
    singleSprite.join(); 
})



rightEye = $("#leftEye").clone().attr("id", "rightEye");
$(".inner").append(rightEye)
// $("#singleInner").css({"width":$("#(")})


    singleBox = $("<div id='singleInner'><div class='in'><h1>!</h1></div></div>");
    // singleBox.hide();
    $(".inner").append(singleBox);
animateDefaults = {
    duration:1500,
    update:true,
    blink:0,
    callback:{func:function(p){},params:{}}
}
function animate(selectors, target,dat={}) {
    dat = $.extend({},animateDefaults,dat);
    var start = emotions.list[emotions.current].d
    end = emotions.list[target].d
    if(dat.update){
        emotions.current = target;
        blink.doCheck();
    }
    let n = dat.callback.params;
   let v = dat.callback.func; 
   if(dat.blink==1){
    $(".eye").delay(700).animate({"margin-top":"15px","margin-right":"15px"},{duration:300,queue:false})
   }else if(dat.blink==2){
    $(".eye").animate({"margin-top":"5px","margin-right":"17px"},{duration:200,queue:false,complete:function(){
        $(this).animate({"margin-top":"0px","margin-right":"20px"},{duration:700,queue:false})
    }})
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
}


let timer = 0;
let cycles = 0;


const t = d3.interval(() => {
    blink.step();
    timer++
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
if(settings.wobble){
    wobble();
    wobble(true);
}
let singleSprite = {
    joined:false,
    join:function(r=false){
        // TODO
        if(emotions.current!="base"){
            changeTo("base","both",true)
        } 
        var start = emotions.list[emotions.current].d
        var single = emotions.single.list["base"].d;
        if(singleSprite.joined){
        $("#singleInner").css({"opacity":0});//,{duration:100});
        interpolator = flubber.separate(single,[start,start], { single: true });
        d3.select(".inner")
        .selectAll("path")
        .datum({start,start})
        .transition()
        .duration(500)
        .attrTween("d", function() { return interpolator; }) 
        d3.select(".inner")
        .selectAll("g")
        .transition()
        .duration(1500)
        .attr("transform", "translate(-69.236386,-2.8148599)" )
        d3.select("#leftEye")
        .transition()
        .duration(500)
        .style("margin-right","20px")
        $("#rightEye").animate({"opacity":100},500)
        singleSprite.joined = false;
    }else{
        d3.select(".inner")
        .selectAll("g")
        .transition()
        .duration(500)
        .attr("transform","translate(-21.123927,27.017475")
        d3.select("#leftEye")
        .transition()
        .duration(500)
        .style("margin-right","0px")
        $("#rightEye").animate({"opacity":0},500)
        interpolator = flubber.combine([start,start], single, { single: true });
        singleSprite.joined = true;
        d3.select(".inner")
        .selectAll("path")
        .datum({start,start})
        .transition()
        .duration(1000)
        .attrTween("d", function() { return interpolator; })
        .on("end",d3=>{
            $("#singleInner").animate({"opacity":"100%"},1500).css({"right":"10px","bottom":"100px"});
        }) 
        }
    }
}

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
