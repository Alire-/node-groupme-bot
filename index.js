/// many thanks to Jan Hammer

var http, HTTPS, director, router, server, port;
var unirest;

var botID  = process.env.BOT_ID;
var apiKey = process.env.API_KEY;
var senderID = process.env.SENDER_ID;

http        = require('http');
HTTPS 	    = require('https');
director    = require('director');
unirest     = require('unirest');

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

function getResponse() {
    console.log("parsing incoming data...");
    var data = JSON.parse(this.req.chunks);
    
    console.log(data);

	if (data['sender_id'] != senderID) {
	    var output, bbb;
	    
	    console.log("looking for a url...");
    	
    	output = '';
    
    	bbb = unirest.get("http://api.smmry.com/")
    	.query({ SM_API_KEY: apiKey, SM_URL: "http://www.reddit.com/r/IAmA/comments/3627lf/im_male_model_jim_gaffigan_ama/cr9zsc1", SM_LENGTH: 3 })
    	.end(function (response) {
    	  	postMessage(response.body['sm_api_content']);
    	  	console.log("response sent!");
    	});
    } else {
        console.log("ignoring self text!");
    }
	

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
    "bot_id" : botID,
    "text" : '"' + message + '"'
  };

  console.log('sending ' + message + ' to ' + botID);

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