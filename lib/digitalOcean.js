var request = require('request');

module.exports = function digitalOceanReshotput(opts) {
  var apiToken = opts.apiToken;
  var dropletId = opts.dropletId;
  var snapshotId = opts.snapshotId;

  var api_endpoint = "https://api.digitalocean.com/v2/droplets/" +
    dropletId + "/actions";

  function sendReset(req, res, next) {
    request.post(api_endpoint,{
      body: {type: 'restore', image: snapshotId},
      auth: {bearer: apiToken}, json: true},
      function(err, response, body) {
        if (err) return next(err);
        if (!/^2/.test(response.statusCode))
          return next(body.message ? new Error(body.message) : body);
        res.redirect('/status/' + body.action.id);
      });
  }

  function getStatus(req, res, next) {
    request.get(api_endpoint + '/' + req.params.action, {
      auth: {bearer: apiToken}, json: true},
      function(err, response, body) {
        if (err) return next(err);
        if (!/^2/.test(response.statusCode))
          return next(body.message ? new Error(body.message) : body);
        res.render('status.jade', {status: body.action.status});
      });
  }

  return {sendReset: sendReset, getStatus: getStatus};
};
