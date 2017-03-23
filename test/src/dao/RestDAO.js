/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('RestDAO', function() {
  var baseURL = 'http://localhost:8765/v0/testDAO';
  var dao;
  var url = require('url');

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.dao.test',
      name: 'MockRestDAOHttpRequest',
      extends: 'foam.net.HTTPRequest',

      requires: [
        'foam.dao.ArraySink',
        'foam.net.HTTPResponse'
      ],

      properties: [
        {
          class: 'String',
          name: 'baseURL',
          value: baseURL
        }
      ],

      methods: [
        function send() {
          var jsonify = this.jsonify;
          var createResponse = this.createResponse;

          if ( this.method === 'PUT' && this.url === this.baseURL ) {
            // put()
            var obj;
            var id;
            var payload;
            var skip;
            var limit;
            var order;
            var predicate;
            try {
              obj = foam.json.parseString(this.payload);
              payload = jsonify(obj);
            } catch (err) {
              return Promise.resolve(this.createResponse({ status: 500 }));
            }

            return dao.put(obj).then(function() {
              return createResponse({ status: 200, payload: payload });
            });
          } else if ( this.method === 'DELETE' &&
                      this.url.indexOf(this.baseURL) === 0 ) {
            // remove()
            id = JSON.parse(decodeURIComponent(this.url.substr(
              this.baseURL.length + 1)));
            return dao.find(id).then(function(o) {
              payload = jsonify(o);
              return dao.remove(o);
            }).then(function() {
              return createResponse({ status: 200, payload: payload });
            });
          } else if ( this.method === 'GET' &&
                      this.url.indexOf(this.baseURL) === 0 &&
                      this.url.charAt(this.baseURL.length) === '/' ) {
            // find()
            id = JSON.parse(decodeURIComponent(this.url.substr(
              this.baseURL.length + 1)));
            return dao.find(id).then(function(o) {
              return createResponse({ status: 200, payload: jsonify(o) });
            });
          } else if ( this.method === 'GET' &&
                      this.url.indexOf(this.baseURL) === 0 &&
                      this.url.substring(this.baseURL.length)
                          .match(/^:select([?].*)$/) ) {
            // select()
            var data = url.parse(this.url, true).query;
            try {
              for ( var key in data ) {
                // Note: This would use data.hasOwnProperty(key), except that
                // Node JS ParsedQueryString objects do not descend from
                // Object.prototype.
                data[key] = foam.json.parseString(decodeURIComponent(
                  data[key]));
              }
            } catch (err) {
              return Promise.resolve(createResponse({ status: 500 }));
            }
            var sink = data.sink || this.ArraySink.create();
            skip = data.skip;
            limit = data.limit;
            order = data.order;
            predicate = data.predicate;
            return dao.select(sink, skip, limit, order, predicate)
              .then(function(sink) {
                var payload = jsonify(sink);
                return createResponse({ status: 200, payload: payload });
              });
          } else if ( this.method === 'POST' &&
                      this.url === this.baseURL + ':removeAll' ) {
            // removeAll()
            var data;
            try {
              data = foam.json.parseString(this.payload);
            } catch (err) {
              return Promise.resolve(createResponse({ status: 500 }));
            }
            skip = data.skip;
            limit = data.limit;
            order = data.order;
            predicate = data.predicate;
            return dao.removeAll(skip, limit, order, predicate)
              .then(function() {
                return Promise.resolve(createResponse({ status: 200 }));
              });
          }

          debugger;

          // Request doesn't match DAO REST API. Return "Not Found".
          return Promise.resolve(createResponse({ status: 404 }));
        }
      ],

      listeners: [
        function jsonify(o) {
          return JSON.stringify(foam.json.Network.objectify(o));
        },
        function createResponse(o) {
          return this.HTTPResponse.create(Object.assign(
              { responseType: 'json' },
              o,
              { payload: Promise.resolve(JSON.parse(o.payload || '{}')) }));
        }
      ]
    });

    foam.register(
      foam.lookup('foam.dao.test.MockRestDAOHttpRequest'),
      'foam.net.HTTPRequest');
  });

  global.genericDAOTestBattery(function(of) {
    // Each test MUST assume that it operates over one and the same DAO for
    // all that test's expectations.
    dao = foam.dao.ArrayDAO.create({ of: of });

    return Promise.resolve(foam.dao.RestDAO.create({
      of: of,
      baseURL: baseURL
    }));
  });

  it('should handle String ids (put+find)', function(done) {
    foam.CLASS({
      package: 'foam.dao.test',
      name: 'HasStringId',

      properties: [
        {
          class: 'String',
          name: 'id'
        }
      ]
    });
    var of = foam.dao.test.HasStringId;
    dao = foam.dao.ArrayDAO.create({ of: of });
    var restDAO = foam.dao.RestDAO.create({ of: of, baseURL: baseURL });
    var id1 = 'foo';
    var id2 = 'bar';

    restDAO.put(of.create({ id: id1 })).then(function() {
      return restDAO.find(id1);
    }).then(function(o) {
      expect(o).not.toBeNull();
      expect(o.id).toBe(id1);
      return restDAO.find(id2);
    }).then(function(o) {
      expect(o).toBeNull();
      done();
    });
  });

  it('should handle composite ids (put+find)', function(done) {
    foam.CLASS({
      package: 'foam.dao.test',
      name: 'HasCompositeId',

      ids: [ 's', 'i', 'f' ],

      properties: [
        {
          class: 'String',
          name: 's'
        },
        {
          class: 'Int',
          name: 'i'
        },
        {
          class: 'Float',
          name: 'f'
        }
      ]
    });
    var of = foam.dao.test.HasCompositeId;
    dao = foam.dao.ArrayDAO.create({ of: of });
    var restDAO = foam.dao.RestDAO.create({ of: of, baseURL: baseURL });
    var o1 = of.create();
    var o2 = of.create({ s: 'foo', i: 1, f: 0.02 });
    var id1 = o1.id;
    var id2 = o2.id;

    expect(id1).toBeDefined();
    expect(id1).not.toBeNull();
    expect(id2).toBeDefined();
    expect(id2).not.toBeNull();

    restDAO.put(o1).then(function() {
      return restDAO.find(id1);
    }).then(function(o) {
      expect(o).not.toBeNull();
      expect(o.id).toEqual(id1);
      return restDAO.find(id2);
    }).then(function(o) {
      expect(o).toBeNull();
      done();
    });
  });
});
