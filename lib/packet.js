var request = require('request');

module.exports = function packetReinstall(opts) {
  var apiKey = opts.apiKey;
  var deviceId = opts.deviceId;

  var api_endpoint = "https://api.packet.net/devices/" + deviceId;

  function sendReset(req, res, next) {
    request.post(api_endpoint + "/actions", {
      body: {type: 'reinstall'},
      headers: {'Accept': 'application/json; version=1',
        'X-Auth-Token': apiKey}, json: true},
      function(err, response, body) {
        if (err) return next(err);
        if (!/^2/.test(response.statusCode))
          return next(body.message ? new Error(body.message) : body);
        // we don't actually use the request ID for anything, but
        // this way I don't need to redesign the status path for Packet
        res.redirect('/status/'+ response.headers['x-request-id']);
      });
  }

  function getStatus(req, res, next) {
    request.get(api_endpoint + '/events?per_page=50', {
      headers: {'Accept': 'application/json; version=1',
        'X-Auth-Token': apiKey}, json: true},
      function(err, response, body) {
        if (err) return next(err);
        if (!/^2/.test(response.statusCode))
          return next(body.message ? new Error(body.message) : body);
        var lastFinish = body.events.findIndex(function(event){
          event.type == "reinstall.203";
        });
        var lastProvision = body.events.findIndex(function(event){
          event.type == "reinstall.200";
        });

        res.render('status.jade', {
          status: lastFinish > lastProvision ? 'completed' : 'in-progress'});
      });
  }

  return {sendReset: sendReset, getStatus: getStatus};
};
