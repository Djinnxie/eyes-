const port = 3000



const express = require('express')
var SSE = require('express-sse');
const app = express()
const { stringReplace } = require('string-replace-middleware');
var r =  require('./public/sprites.json')
// root=JSON.parse(root);
var spriteset = r.root.useset;

var generateSprites = function(spriteset){
  let controlsOut = "";
  let spr = r.root.spriteSets[spriteset];
  let tf = spr.transformation;
  let sprites = spr.sprites;
  let htmlOut = `<g transform="${tf}">\n`;
  sprites.forEach(s =>{
      htmlOut+=`<path id="${s.id}" data-button="${s.button}"\n d="${s.d}" />\n`;
      controlsOut+=`<a href="/api/set/${s.id}">${s.button}</a><br/>`
    })
    htmlOut += "</g>"
    // console.log(htmlOut);
    return {"SVGOUT":htmlOut,"SVGCONTROLS":controlsOut};
  }
// console.log(spriteset)
// generateSprites(spriteset);

app.use(stringReplace(
    generateSprites(spriteset)
    // {'$[SVGOUT]' => (req,res) => 'owo'}
)
);
app.use(express.static('public'));
app.use(express.json());


var sse = new SSE({exp:"base"});

// TODO

// app.get('/control', (req, res) => {
//   res.send(controls)
// })
app.get("/api/set/:exp", function (req, res) {
    // console.log(req.params.exp);
    sse.send({exp:req.params.exp});
    // res.send(controls)
    res.redirect("/control.html")
})
app.get('/stream', sse.init);

app.listen(port, () => {
  console.log(`EYES listening on port ${port}`)
})
