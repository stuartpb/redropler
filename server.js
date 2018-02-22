var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;

var serverId = process.env.SERVER_ID;
var snapshotId = process.env.SNAPSHOT_ID;
var serverAddress = process.env.SERVER_ADDRESS;
var sshIdentity = process.env.SSH_IDENTITY;
var sshUsername = process.env.SSH_USERNAME;
var preResetCommand = process.env.PRE_RESET_COMMAND;
var preResetCommandTimeout = process.env.PRE_RESET_COMMAND_TIMEOUT;

var service;

if (process.env.DIGITALOCEAN_API_TOKEN) {
  service = require('./lib/digitalOcean.js')({
    apiToken: process.env.DIGITALOCEAN_API_TOKEN,
    dropletId: serverId,
    snapshotId: snapshotId
  });
} else if (process.env.PACKET_API_KEY) {
  service = require('./lib/packet.js')({
    apiKey: process.env.PACKET_API_KEY,
    deviceId: serverId,
  });
} else {
  console.error('No compatible service token/key defined');
  process.exit(1);
}

var defaultPreResetCommand =
  'echo "The system is going down for reset NOW!" | wall';

var sshCommand = [
  'temp=`mktemp`',
  'printf "%s" "$1" >> "$temp"',
  'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no ' +
    '-i "$temp" "$2@$3" -- "$4"',
  'rm "$temp"'].join('\n');

var app = express();

app.set('serverAddress', serverAddress);

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
    serverAddress,
    preResetCommand || defaultPreResetCommand,
    preResetCommandTimeout || 5]);

  sshProc.stdout.on('data', function (data) {
    console.log('ssh stdout: ' + data);
  });
  sshProc.stderr.on('data', function (data) {
    console.log('ssh stderr: ' + data);
  });
  sshProc.on('close', function (code) {
    if (sshProc) {
      sshProc = null;
      next();
    }
  });

  function sshProcTimeout() {
    if (sshProc) {
      sshProc.kill();
      sshProc.disconnect();
      sshProc = null;
      next();
    }
  }

  setTimeout(sshProcTimeout,
    preResetCommandTimeout ? preResetCommandTimeout * 1000 : 5000);
}

var postStack = [service.sendReset];
if (sshIdentity && serverAddress) postStack.unshift(sendCommand);
app.post('/', postStack);

app.get('/status/:action', service.getStatus);

app.listen(process.env.PORT || 5000, process.env.IP);
