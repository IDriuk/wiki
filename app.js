"use strict";

var express = require('express'),
	bodyParser = require('body-parser'),
  	swig = require('swig'),
  	path = require('path'),
  	routes = require('./routes/index');

var app = express();
  
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.engine('html', swig.renderFile);

app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
});