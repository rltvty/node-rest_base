var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var favicon = require('serve-favicon');
var morgan_logger = require('morgan');
var cookieParser = require('cookie-parser');
var express_logger = require('./express_logger');

module.exports = function(config, logger, assign_routes_method) {
  var app = express();

  if (config.views_folder) {
    app.set('views', path.join(__dirname, config.views_folder));
    app.set('view engine', 'jade');
  }

  if (config.favicon_path) {
    app.use(favicon(__dirname + config.favicon_path));
  }

  app.use(express_logger.express_logger(logger));
  app.use(morgan_logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  if (config.static_folder) {
    app.use(express.static(path.join(__dirname, config.static_folder)));
  }

  if (assign_routes_method) {
    assign_routes_method(app);
  } else {
    app.get('/ping', function(request, response){
      response.status(200).send('pong');
    });
  }

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers


  if (config.is_production) { //production error handler - no stacktraces leaked to user
    app.use(function(err, req, res, next) {
      res.status(err.status || 500).json({
        message: err.message,
        error: {}
      });
    });
  } else { // development & test error handler - will print stacktrace
    app.use(function(err, req, res, next) {
      res.status(err.status || 500).json({
        message: err.message,
        error: err
      });
    });
  }
 return app;
};
