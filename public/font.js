const buffer = fetch('assets/Unifontexmono.ttf').then(res => res.arrayBuffer());
let glyphs=[];
$("body").append($("<div id='fontTest'><p></p></div>"))
let textbox = $("#fontTest p")
let tableIndex = 0;
let loop = 0;
let genRandom = function(font,table,main=false,loop=0){
    if(main){
        // $('#fontTest').attr('style',$('.inner').attr("style"))
        var pos = $(".inner").offset() // Grab the knob's page location
        $('#fontTest').css({'left': pos.left, 'top': pos.top - 100})
    }
    // let blank=false;
    if(Math.random()>0.4){

    glyph={unicode:160}//return;
    // blank=true;
    } 
    else{

    let glyphs = font.glyphs.glyphs
    glyph = glyphs[Math.floor(Math.random()*Object.keys(glyphs).length)]
    }
    // if(Math.random()>0.97&&loop)
         tableIndex=Math.floor(Math.random()*table.length)-1
    if(typeof(table[tableIndex])=="undefined") return;
    let ccc = Math.random();
    if(ccc>0.995){//&&table[tableIndex].text()!=""){
        table[tableIndex].addClass("invert");
    }else if(ccc>0.6){
        table[tableIndex].css("color","#ff0000ff")
        table[tableIndex].removeClass("invert");
    }else{
        table[tableIndex].css("color","#ff0000"+(Math.floor(Math.random()*255)).toString(16))
        table[tableIndex].removeClass("invert");
    }
    if(glyph.unicode==160) 
        table[tableIndex].removeClass("invert");
    if(tableIndex>=table.length){
        tableIndex=0;
        loop++
    }
    table[tableIndex].text(
        String.fromCharCode(glyph.unicode)
    )
    tableIndex++;
    return;
    // if($("#fontTest").text().length>140){
    // if ($('#fontTest')[0].scrollWidth >  $('#fontTest').innerWidth()) {
    if (textbox.prop('scrollWidth') > textbox.width() ) {
    textbox.text(textbox.text().substr(0,textbox.text().length-3)+"\n\n") 
    }

    textbox.text(
    textbox.text()
    // .substr(1)
    +String.fromCharCode(glyph.unicode)
    )
   if(loop>0){
    loop--
    genRandom(font,table,false,loop)

   } 
        
    // }else{

    // // console.log(glyph);
    // $('#fontTest').append(String.fromCharCode(glyph.unicode));
    // }
    // return glyph
}
buffer.then(data => {
    const font = opentype.parse(data);
    table = genTable($("body"));
    setInterval(function(){genRandom(font,table,true,5)}, 5);
    setInterval(function(){genRandom(font,table)}, 1);
    setInterval(function(){genRandom(font,table)}, 1)   ;
    // setInterval(function(){genRandom(font,table)}, 1);
    // setInterval(function(){genRandom(font,table)}, 1);
})

genTable=function(el){
    let w = parseInt(el.css("width"));
    let h = parseInt(el.css("height"));
    let cw=0;
    let ch=0;
    
   tt = $("<table class='ft'><tr><td class='ftes'></td></tr></table>").css({"display":"none"}) 
   $("body").append(tt);
   let tw=parseInt(tt.find("td").css("width"));
   let th=parseInt(tt.find("td").css("width"));
    tt.remove(); 
   let out = [];
    let table = $("<table></table>").addClass('ft')
    while(ch<h){
        let row = $("<tr></tr>");
       ch+=th; 
       while(cw<w){
        let cc = out.length;
        out.push($("<td>"+
        String.fromCharCode(160)
            +"</td>").addClass('ftes'))
        row.append(out[cc]);
        cw+=tw;
       }
       cw=0;
       table.append(row);
    }
    $("#fontTest").append(table);
    return out
}