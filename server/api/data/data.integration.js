'use strict';

var app = require('../..');
var request = require('supertest');

var newData;

describe('Data API:', function () {

  describe('POST /api/data/', function () {
    beforeEach(function (done) {
      request(app).post('/api/data/').send({
        type: 'data_type_test',
        info: 'some data'
      }).expect(201).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        newData = res.body;
        done();
      });
    });

    it('should respond with the newly created data', function () {
      newData.info.should.equal('some data');
    });
  });
});
//# sourceMappingURL=data.integration.js.map
