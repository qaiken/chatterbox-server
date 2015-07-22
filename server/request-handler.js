var fs = require('fs');
var path = require('path');
var url = require('url');
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var messagesFile = path.join(__dirname,'messages.json');

var collectData = function(request,cb) {
  var data = '';

  request.on('data', function(chunk) {
    data += chunk;
  });
  
  request.on('end', function() {
    cb(data);
  });
};

var getFileContents = function(request,response) {
  var contentType, headerType;
  var parsedUrl = url.parse(request.url);

  if( parsedUrl.pathname === '../client/classes/messages' ) {
    request.url = messagesFile;
  }
  
  headerType = path.extname(request.url).substr(1);

  if( headerType === 'js' ) {
    contentType = 'application/javascript';
  } else if ( headerType === 'css' ) {
    contentType = 'text/css';
  } else if ( headerType === 'html' ) {
    contentType = 'text/html';
  } else if ( headerType === 'json' ) {
    contentType = 'application/json';
  } else {
    contentType = 'text/plain';
  }

  fs.readFile(request.url, function(err, content) {
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = contentType;
    
    if (err) {
      response.writeHead(404, defaultCorsHeaders);
      response.end('404');
      return;
    }
    response.writeHead(200, defaultCorsHeaders);
    response.end(content);
  });
};

var writeMessages = function(request,response,messageData) {

  messageData = JSON.parse(messageData);

  fs.readFile(messagesFile, function(err, content) {

    if (err) {console.log("error in writeMessages");}

    fileData = JSON.parse(content);

    messageData.objectId = fileData.currentId++;
    messageData.createdAt = new Date();
    messageData.roomname = messageData.roomname || 'lobby';

    fileData.results.unshift(messageData);

    fs.writeFile(messagesFile, JSON.stringify(fileData), function (err) {

      if (err) {console.log("wheee!");}

      response.setHeader("Content-Type",'application/json');
      response.writeHead(201, defaultCorsHeaders);
      response.end(JSON.stringify(fileData));
    });

  });
};

var requestHandler = function(request, response) {

  request.url = '../client' + request.url;

  if ( request.url === '../client/' ) {
    request.url = '../client/index.html';
  }

  console.log("Serving request type " + request.method + " for url " + request.url);

  if( request.method === 'GET' ) {
    getFileContents(request, response);
  }

  if( request.method === 'POST' ) {
    collectData(request, function(data) {
      writeMessages(request,response,data);
    });
  }
};

module.exports = requestHandler;
