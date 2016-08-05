
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
	  var data = response.body;
    // need to split messages based on charater count
    console.log("parsing smmry response...");
    console.log(data['sm_api_character_count']);
    console.log(data['sm_api_error']);
    console.log(data['sm_api_keyword_array']);

    postMessage(data['sm_api_content']);
	});
}

function postResponse() {
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
    
    // some kind of stats for a picture or something

    // seen
    
    // remind me
}

function postMessage(message) {
  var options, body, botReq;

  
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
      if (res.statusCode === 202) {
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
