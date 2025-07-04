const port = 3000



const express = require('express')
var SSE = require('express-sse');
const app = express()
app.use(express.static('public'));
app.use(express.json());

var sse = new SSE({exp:"base"});

// TODO
var controls = `
    <head><style>
    a{ font-size:300%;}
    </style>
    </head><body>
    <a href='/'>Display</a><br/><br/>
    <h1>Controls</h1>
    <a href='/api/set/base'>o o</a><br/>
    <a href='/api/set/angry'>^ ^</a><br/>
    <a href='/api/set/shock'>O O</a><br/>
    <a href='/api/set/x'>X X</a><br/>
    </body>
`

app.get('/control', (req, res) => {
  res.send(controls)
})
app.get("/api/set/:exp", function (req, res) {
    console.log(req.params.exp);
    sse.send({exp:req.params.exp});
  res.send(controls)
})
app.get('/stream', sse.init);

app.listen(port, () => {
  console.log(`EYES listening on port ${port}`)
})
