"use strict";

var express = require('express'),
    app = express(),
  	swig = require('swig'),
    routes = require('./routes/index'),
  	path = require('path');
	
  
app.set('port', process.env.PORT || 3000);

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
//app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
});
