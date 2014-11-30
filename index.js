var http = require('http');
var bunyan = require('bunyan');
var underscore = require('underscore');
var request = require('request');
var config = require('./lib/config');
var express_app = require('./lib/express_app');

var global_namespace_key = config.name + '_global_key';
var server = null;
var setup_routes_method = null;

if (!(global_namespace_key in process)) {
  var globals = {};

  globals.config = config;
  globals.logger = setup_logger();
  globals.underscore = underscore;
  globals.request = request;

  globals.start_server = function() {
    if (server == null) {
      var app = express_app(globals.config, globals.logger, setup_routes_method);
      server = http.createServer(app);

      var server_port = globals.config['http_server_port'] || 3001;
      server.listen(server_port);
      globals.logger.info('Server listening on port %s', server_port);
    }
  };

  globals.stop_server = function() {
    if (server != null) {
      server.close();
      server = null;
      globals.logger.info('Server stopped listening on port %s', globals.config['http_server_port']);
    }
  };

  globals.set_setup_routes_method = function(routes_method) {
    setup_routes_method = routes_method;
  };

  process[global_namespace_key] = globals;
  globals.logger.info('Initialized global object');
  globals.logger.info('Running on node version: ' + process.version);
}

module.exports = {
  config : process[global_namespace_key].config,
  logger : process[global_namespace_key].logger,
  app : process[global_namespace_key].app,
  start_server : process[global_namespace_key].start_server,
  stop_server : process[global_namespace_key].stop_server,
  _ : process[global_namespace_key].underscore,
  set_setup_routes_method: process[global_namespace_key].set_setup_routes_method,
  request: process[global_namespace_key].request
};

function setup_logger() {
  var logging_path = config['logging_path'];
  var logging_level = config['logging_level'];
  var logging_streams = [];

  if (logging_path) {
    logging_streams.push({ path: logging_path, level: logging_level })
  }

  if (config['verbose'] || logging_path.count == 0) {
    logging_streams.push({ stream: process.stdout, level: logging_level });
  }

  return bunyan.createLogger({ name: config['name'], streams: logging_streams });
}
