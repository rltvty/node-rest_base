var _ = require('underscore');
var yaml = require('js-yaml');
var command_args = require('./command_args.js');

module.exports = function() {
  var environment = process.env.NODE_ENV;

  if (environment == undefined || environment == null) {
    environment = 'development';
  }

  var output = {
    is_production: environment === 'production',
    is_development: environment === 'development',
    is_test: environment === 'test',
    name: 'rest_base',
    config_location: process.cwd() + '/config.yml'
  };

  try {
    output = _.extend(output, require(output.config_location)[environment]);
  } catch (exception) {
    console.log('Please create a config.yml file in the root directory as');
    console.log('described in the rest_base README.me for this warning to go');
    console.log('away.');
  }

  if (! _.has(output, 'logging_path')) {
    output.logging_path = './logs/' + output.name + '_' + environment + '.log';
  }

  if (! _.has(output, 'logging_level')) {
    output.logging_level = output.is_production ? 'info' : 'debug';
  }

  if (! _.has(output, 'http_server_port')) {
    output.http_server_port = output.http_server_port ? 8080 : 3030;
  }

  return _.extend(output, command_args);
};
