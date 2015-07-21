/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var fs = require('fs');
var path = require('path');
var url = require('url');

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.

  var getFileContents = function(url) {
    fs.readFile(url, function(err, content){
      if (err) {console.log('error in index call');}
      response.end(content);
    });
  }

  var writeMessages = function(messData){
    messData = JSON.parse(messData);
    var oldData = '';
    fs.readFile('messages.json', function(err, content){
      if (err) {console.log("ack!")}
      oldData = JSON.parse(content);

      messData.objectId = oldData.currentId++;
      messData.createdAt = new Date();

      oldData.results.unshift(messData);
      fs.writeFile('messages.json', JSON.stringify(oldData), function (err) {
        if (err) {console.log("wheee!")};
      });
    });
  }

  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  console.log("Serving request type " + request.method + " for url " + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;
  var parsedUrl = url.parse(request.url);
  var data = '';

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  if (parsedUrl.pathname === '/classes/messages') {//?  /
    if (request.method === 'GET') {
      headers['Content-Type'] = 'application/json';
      getFileContents('messages.json');
    } else if (request.method === 'POST') {
      request.on('data', function(chunk){
        data += chunk;
      });
      request.on('end', function(){
        writeMessages(data);  //timing?
      });
    }
    return;
  }


  if ( request.url === "/" ) {
    request.url = '../client/index.html';
  } else {
    request.url = '../client/' + request.url;
  }

  var headerType = path.extname(request.url).substr(1);

  headers['Content-Type'] = 'text/' + headerType;



  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  getFileContents(request.url);




  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

module.exports = requestHandler;
