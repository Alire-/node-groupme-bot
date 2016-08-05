/// many thanks to Jan Hammer
"use strict";

// groupme config
var gmBotID    = process.env.GM_BOT_ID; // groupme bot id
var gmSenderID = process.env.GM_SENDER_ID; // bot's groupme sender id

// summary config
var smApiKey    = process.env.SM_API_KEY; // smmry api key
var smSentences = 2; // number of sentences to get from smmry

// required modules 
var http      = require('http');
var HTTPS     = require('https');
var director  = require('director');
var unirest   = require('unirest');

// set routing paths
var router = new director.http.Router({
  '/' : {
    post: postResponse,
    get: getResponse
  }
});

// start listening server
var server = http.createServer(function (req, res) {
  req.chunks = [];
  req.on('data', function (chunk) {
    req.chunks.push(chunk.toString());
  });

  router.dispatch(req, res, function(err) {
    res.writeHead(err.status, {"Content-Type": "text/plain"});
    res.end(err.message);
  });
});

var port = Number(process.env.PORT || 5000);
server.listen(port);

function getResponse() {
  this.res.writeHead(200);
  this.res.end("KANE v0.1");
}
