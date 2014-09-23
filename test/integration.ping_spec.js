var should = require('should');
var request = require('request');
var base = require('../index');

describe('http_server ping', function() {
  var root_url = 'http://localhost:' + base.config.http_server_port;

  beforeEach(function(done) {
    base.start_server();
    done();
  });

  describe('GET /ping', function() {
    it('responds with pong', function(done) {
      request.get(root_url + '/ping', function(error, response, body) {
        response.headers['content-type'].should.equal('text/html; charset=utf-8');
        response.statusCode.should.equal(200);
        body.should.equal('pong');
        done();
      });
    });
  });

  afterEach(function(done) {
    base.stop_server();
    done();
  });
});
