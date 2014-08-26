var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var api_endpoint = "https://api.digitalocean.com/v2/droplets/" +
  process.env.DROPLET_ID + "/actions";

var app = express();

app.set('dropletDomain',process.env.DROPLET_DOMAIN);

app.use(express.static(__dirname + '/static'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.render('index.jade');
});

app.post('/', function(req, res, next) {
  request.post(api_endpoint,{
    body: {type: 'restore', image: process.env.RESTORE_IMAGE_ID},
    auth: {bearer: process.env.DIGITALOCEAN_API_TOKEN}, json: true},
    function(err, response, body) {
      if (err) return next(err);
      if (!/^2/.test(response.statusCode)) return next(new Error(body));
      res.redirect('/status/' + body.id);
    });
});

app.get('/status/:action', function(req, res, next) {
  request.get(api_endpoint + '/' + req.params.action, {
    auth: {bearer: process.env.DIGITALOCEAN_API_TOKEN}, json: true},
    function(err, response, body) {
      if (err) return next(err);
      if (!/^2/.test(response.statusCode)) return next(new Error(body));
      res.render('status.jade', body);
    });
});

app.listen(process.env.PORT || 5000, process.env.IP);
