const express = require('express')
var SSE = require('express-sse');
const app = express()
const port = 3000
app.use(express.static('public'));
app.use(express.json());

var sse = new SSE({exp:"base"});

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get("/api/set/:exp", function (req, res) {
    console.log(req.params.exp);
    sse.send({exp:req.params.exp});
  res.send(`
    <head><style>
    a{ font-size:300%;}
    </style>
    </head><body>
    <a href='/api/set/base'>o o</a><br/>
    <a href='/api/set/angry'>^ ^</a><br/>
    <a href='/api/set/shock'>O O</a><br/>
    <a href='/api/set/x'>X X</a><br/>
    </body>
    `)
})
app.get('/stream', sse.init);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
