var http = require('http');
var bunyan = require('bunyan');
var underscore = require('underscore');
var config = require('./config')();
var express_app = require('./express_app');

var global_namespace_key = config.name + '_global_key';

if (!(global_namespace_key in process)) {
  var globals = {};

  globals.config = config;

  var logging_streams = [
    {
      path: globals.config.logging_path,
      level: globals.config.logging_level
    }
  ];

  if (globals.config.verbose) {
    logging_streams.push({
        level: globals.config.logging_level,
        stream: process.stdout
      });
  }

  globals.logger = bunyan.createLogger({
    name: config.name,
    streams: logging_streams
  });

  globals.app = express_app(globals.logger);
  globals.underscore = underscore;

  var server = null;

  globals.start_server = function() {
    if (server == null) {
      server = http.createServer(globals.app);
      server.listen(globals.config.http_server_port);
      globals.logger.info('Server listening on port '+ globals.config.http_server_port);
    }
  };

  globals.stop_server = function() {
    if (server != null) {
      server.close();
      server = null;
      globals.logger.info('Server stopped listening on port '+ globals.config.http_server_port);
    }
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
  _ : process[global_namespace_key].underscore
};
