/// many thanks to Jan Hammer
"use strict";

var http, HTTPS, director, router, server, port;
var unirest;

// groupme config
var gmBotID  = process.env.GM_BOT_ID; // groupme bot id
var gmSenderID = process.env.GM_SENDER_ID; // bot's groupme sender id

// summary config
var smApiKey = process.env.SM_API_KEY; // smmry api key
var smSentences = 2; // number of sentences to get from smmry


http      = require('http');
HTTPS     = require('https');
director  = require('director');
unirest   = require('unirest');

router = new director.http.Router({
  '/' : {
    post: getResponse,
    get: getResponse
  }
});

server = http.createServer(function (req, res) {
  req.chunks = [];
  req.on('data', function (chunk) {
    req.chunks.push(chunk.toString());
  });

  router.dispatch(req, res, function(err) {
    res.writeHead(err.status, {"Content-Type": "text/plain"});
    res.end(err.message);
  });
});

port = Number(process.env.PORT || 5000);
server.listen(port);

////////////////////////////////////////////////////////////////////////////////////
/// move out to bot.js
////////////////////////////////////////////////////////////////////////////////////
function urlCheck(text) {
    console.log("checking for url...");
    // you can get really complex with this regex, feel free to change it if this doesn't work for you
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    var result = null;
    
    if ((result = urlRegex.exec(text)) !== null) {
        console.log("url found...");
        return result[0]; // only return first match
    } else {
        console.log("no url found...");
        return null;
    }
}

function getSmmry(url) {
  console.log("querying smmry...");
  console.log(url);
	unirest.get("http://api.smmry.com/")
	.query({ SM_API_KEY: smApiKey, SM_URL: url, SM_LENGTH: smSentences, SM_WITH_BREAK: '' })
	.end(function (response) {
	    console.log("returning smmry response...");
	    postMessage(response.body['sm_api_content']);
	  	return response;
	});
}

function getResponse() {
    var data, output, url;
    
    console.log("parsing incoming data...");
    data = JSON.parse(this.req.chunks);
    //console.log(data);
    
    if (data['sender_id'] !== gmSenderID) {
      // find a url
      url = urlCheck(data['text']);
      
      if (url !== null) {
          console.log("found url...");
          getSmmry(url);
      } 
    } else {
      console.log("ignoring self text!");
    }
    
    
    // check for twitter pic
    // twitterCheck()
    
    // move on to smmry check
    // smmryCheck()
    
    // some kind of stats for a picture or something

    // seen
    
    // remind me
}

function postMessage(message) {
  var botResponse, options, body, botReq;

  botResponse = "bot response here";

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : gmBotID,
    "text" : message
  };

  //console.log('sending ' + message + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


/*
    &SM_API_KEY=xxxx      // Mandatory, N represents your registered API key.
    &SM_URL=X                   // Optional, X represents the webpage to summarize.
    &SM_LENGTH=N                // Optional, N represents the number of sentences returned, default is 7
    &SM_KEYWORD_COUNT=N         // Optional, N represents how many of the top keywords to return
    &SM_QUOTE_AVOID             // Optional, summary will not include quotations
    &SM_WITH_BREAK              // Optional, summary will contain string [BREAK] between each sentence
    
    Here are the possible indexes of the array returned by JSON.
    $result = json_decode($response, true);
    $result['sm_api_message'];        // Contains notices, warnings, and error messages.
    $result['sm_api_character_count'];// Contains the amount of characters of summary content that might have been returned
    $result['sm_api_title'];          // Contains the title when possible
    $result['sm_api_content'];        // Contains the summary
    $result['sm_api_keyword_array'];  // Contains an array of the top ranked keywords in descending order
    $result['sm_api_error'];          // Contains error number to indicate kind of error
*/