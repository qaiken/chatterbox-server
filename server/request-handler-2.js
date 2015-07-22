var fs = require('fs');
var express = require('express');
var path = require('path');

var messagesFile = path.join(__dirname,'messages.json');

var collectData = function(req,cb) {
	var data = '';

  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
  	cb(data);
  });
};

exports.getMessages = function(req,res) {
	res.type('json').status(200).sendFile(messagesFile);
};

exports.writeMessage = function(req,res) {
  collectData(req,function(data) {

    var messData = JSON.parse(data);

    fs.readFile(messagesFile, function(err, content) {
      if (err) {console.log("error in writeMessages");}
      var fileData = JSON.parse(content);

      messData.objectId = fileData.currentId++;
      messData.createdAt = new Date();
      fileData.results.unshift(messData);

      fs.writeFile(messagesFile, JSON.stringify(fileData), function (err) {
        if (err) {console.log("writeFile err!");}
        res.type('json').status(201).sendFile(messagesFile);
      });

    });
  });
};

