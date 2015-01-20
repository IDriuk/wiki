
var MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    db = null;

var express = require('express');
var router = express.Router();


MongoClient.connect('mongodb://localhost:27017/wiki', function (err, dbconn) {
  db = dbconn;
});


router.get('/areas', function(req, res) {
  var areasArray = [];
  db.collection('mems').find({}, {'areas': true, '_id': false}).toArray(function (err, areas) {  
    for (var i = 0, l = areas.length; i < l; i++) {
      areasArray.push(areas[i].areas);
    }
    res.json({areas: areasArray});
  });
});


router.get('/mems', function(req, res) {
  db.collection('mems').find().sort({name: 1}).toArray(function(err, mems) {
    res.json(mems);
  });
});


router.post('/mems', function(req, res) {
  if (req.body._id) { 
    req.body._id = new ObjectID(req.body._id);
    db.collection('mems')
      .update(
        {'_id': req.body._id},
        req.body, 
        {'upsert': true}, 
        function(err, data) {
          if (err) throw err;
          db.collection('mems')
            .findOne({_id: req.body._id}, function(err, data) {
          	  if (err) throw err;
          	  res.json(data);
          	});
        });
  } else {	
    db.collection('mems').insert(req.body, function(err, data) {
      if (err) throw err;
      res.json(data[0]);
    });
  }
});


router.get('/delete/:id', function(req, res) {   
  var objID = new ObjectID(req.params.id); 

  db.collection('mems').remove({_id: objID}, function (err,data) { res.json(data);});
});

  
router.get('/', function(req, res) {
    res.render('home');
});


module.exports = router;