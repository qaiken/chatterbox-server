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

var messagesFile = path.join(__dirname,'messages.json');

var requestHandler = function(request, response) {

  console.log(request.url);

  // Request and Response come from node's http module.
  var headers = defaultCorsHeaders;
  var parsedUrl = url.parse(request.url);
  var data = '';

  var getFileContents = function(url,contentType) {
    fs.readFile(url, function(err, content) {
      headers['Content-Type'] = contentType;
      if (err) {
        response.writeHead(404, headers);
        response.end('404');
        return;
      }
      response.writeHead(200, headers);
      response.end(content);
    });
  }

  var writeMessages = function(messData){
    messData = JSON.parse(messData);

    var oldData = '';

    fs.readFile(messagesFile, function(err, content){
      if (err) {console.log("error in writeMessages")}
      oldData = JSON.parse(content);

      messData.objectId = oldData.currentId++;
      messData.createdAt = new Date();

      oldData.results.unshift(messData);

      fs.writeFile(messagesFile, JSON.stringify(oldData), function (err) {
        if (err) {console.log("writeFile err!")};
        response.writeHead(201, headers)
        response.end(JSON.stringify(oldData));
      });

    });
  }

  console.log("Serving request type " + request.method + " for url " + request.url);

  // See the note below about CORS headers.

  if ( request.url === "/" ) {
    request.url = '../client/index.html';
  } else {
    request.url = '../client' + request.url;
  }

  var headerType = path.extname(request.url).substr(1);

  if (parsedUrl.pathname === '/classes/messages') {//?  /
    if (request.method === 'GET') {
      getFileContents(messagesFile,'application/json');
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

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.

  getFileContents(request.url,'text/' + headerType);


  // Make sure to always call response.end() -
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
