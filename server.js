var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var request = require('request');

var dropletId = process.env.DROPLET_ID;
var dropletDomain = process.env.DROPLET_DOMAIN;
var sshIdentity = process.env.SSH_IDENTITY;
var sshUsername = process.env.SSH_USERNAME;
var preResetCommand = process.env.PRE_RESET_COMMAND;
var preResetCommandTimeout = process.env.PRE_RESET_COMMAND_TIMEOUT;

var defaultPreResetCommand =
  'echo "The system is going down for reset NOW!" | wall';

var sshCommand = [
  'temp=`mktemp`',
  'printf "%s" "$1" >> "$temp"',
  'timeout $5 ' +
    'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no ' +
      '-i "$temp" "$2@$3" -- "$4"',
  'rm "$temp"'].join('\n');

var api_endpoint = "https://api.digitalocean.com/v2/droplets/" +
  dropletId + "/actions";

var app = express();

app.set('dropletDomain',dropletDomain);

app.use(express.static(__dirname + '/static'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.render('index.jade');
});

function sendCommand(req, res, next) {
  var sshProc = spawn('bash', ['-c', sshCommand, 'sshCommand',
    sshIdentity+'\n',
    sshUsername || 'root',
    dropletDomain,
    preResetCommand || defaultPreResetCommand,
    preResetCommandTimeout || 5]);

  sshProc.stdout.on('data', function (data) {
    console.log('ssh stdout: ' + data);
  });
  sshProc.stderr.on('data', function (data) {
    console.log('ssh stderr: ' + data);
  });
  sshProc.on('close', function (code) {
    next();
  });
}

function sendReset(req, res, next) {
  request.post(api_endpoint,{
    body: {type: 'restore', image: process.env.RESTORE_IMAGE_ID},
    auth: {bearer: process.env.DIGITALOCEAN_API_TOKEN}, json: true},
    function(err, response, body) {
      if (err) return next(err);
      if (!/^2/.test(response.statusCode))
        return next(body.message ? new Error(body.message) : body);
      res.redirect('/status/' + body.action.id);
    });
}

var postStack = [sendReset];
if (sshIdentity && dropletDomain) postStack.unshift(sendCommand);
app.post('/', postStack);

app.get('/status/:action', function(req, res, next) {
  request.get(api_endpoint + '/' + req.params.action, {
    auth: {bearer: process.env.DIGITALOCEAN_API_TOKEN}, json: true},
    function(err, response, body) {
      if (err) return next(err);
      if (!/^2/.test(response.statusCode))
        return next(body.message ? new Error(body.message) : body);
      res.render('status.jade', body);
    });
});

app.listen(process.env.PORT || 5000, process.env.IP);
