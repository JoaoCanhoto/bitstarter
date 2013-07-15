var express = require('express');

var app = express.createServer(express.logger());


fs = require('fs');
buf = new Buffer(256);
fs.readFile('./index.html', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
//  console.log(data);
buf=data;
//console.log(buf.toString('utf8')  );
});



app.get('/', function(request, response) {
  response.send( buf.toString('utf8') ) ; //, 0, buff)  );
//  response.send("Hello World2.2!");
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

