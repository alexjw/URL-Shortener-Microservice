'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectID

var cors = require('cors');

var app = express();

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// Can't get env variables work
mongoose.connect("mongodb+srv://alex:alex1995@freecodecamp-w89rl.gcp.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true })
const Schema = mongoose.Schema;

const urlSchema = new Schema( {
  original_url: String,
  short_url: Number
} );

const counterSchema = new Schema( {
  this_is_a_number: Number,
  actual_number: Number
} );

var Url = mongoose.model('Url', urlSchema);
var Counter = mongoose.model('Counter', counterSchema);
let counterObj = undefined

var createAndSaveCounter = function() {
      counterObj = new Counter({this_is_a_number: 1, actual_number: 1})
      counterObj.save()
};

//createAndSaveCounter();
Counter.findOne({this_is_a_number: 1}, (err, data) => {
  if(data == null)
    createAndSaveCounter()
  else 
    counterObj = data
})

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// New URL
app.post("/api/shorturl/new", function (req, res) {
  let param = req.body.url
  // Regex from https://www.regextester.com/93652
  let regex =  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm
  if(regex.test(param)) {
    let short = counterObj.actual_number
    let newUrl = new Url({original_url: param, short_url: short})
    counterObj.actual_number = counterObj.actual_number + 1
    newUrl.save()
    counterObj.save()
    res.json({"original_url": param,"short_url": newUrl.short_url});
  }
  else
    res.json({"error":"invalid URL"});
});

//Redirect
app.get("/api/shorturl/:id", function (req, res) {
  Url.findOne({short_url: req.params.id}, (err, data) => {
    if(data == null)
      res.json({"error":"invalid URL"})
    else
      res.redirect(data.original_url);
  })
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});