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

describe('RestDAOHandler', function() {
  var port = 8080;
  var urlPath = '/dao';
  var baseURL = 'http://0.0.0.0:' + port + urlPath;
  var server;
  var serverPromise;
  var shutdownPromise = Promise.resolve(null);
  var serverDAO;
  var handler;
  var clientDAO;

  beforeEach(function() {
    serverDAO = foam.dao.ArrayDAO.create();
    server = foam.net.node.Server.create({
      port: port,
      handlers: [
        (handler = foam.net.node.RestDAOHandler.create({
          urlPath: urlPath,
          dao: serverDAO
        }))
      ]
    });
    serverPromise = shutdownPromise.then(function() {
      return server.start();
    });
  });
  afterEach(function() {
    shutdownPromise = server.shutdown();
  });

  global.genericDAOTestBattery(function(of) {
    return serverPromise.then(function() {
      return (clientDAO = foam.dao.RestDAO.create({
        of: of,
        baseURL: baseURL
      }));
    });
  });

  describe('URL-encoded select()', function() {
    beforeEach(function() {
      foam.CLASS({
        package: 'foam.dao.test',
        name: 'URLEncodedSelectRestDAO',
        extends: 'foam.dao.RestDAO',

        methods: [
          function select(sink, skip, limit, order, predicate) {
            // Send input data as query parameters.
            var query = [];

            var networkSink = this.Serializable.isInstance(sink) && sink;
            if ( networkSink )
              query.push('sink=' + encodeURIComponent(this.jsonify_(networkSink)));

            if ( typeof skip !== 'undefined' )
              query.push('skip=' + encodeURIComponent(this.jsonify_(skip)));
            if ( typeof limit !== 'undefined' )
              query.push('limit=' + encodeURIComponent(this.jsonify_(limit)));
            if ( typeof order !== 'undefined' )
              query.push('order=' + encodeURIComponent(this.jsonify_(order)));
            if ( typeof predicate !== 'undefined' )
              query.push('predicate=' + encodeURIComponent(this.jsonify_(predicate)));

            return this.createRequest_({
              method: 'GET',
              url: this.baseURL + ':select?' + query.join('&')
            }).send().then(this.onResponse.bind(this, 'select'))
                .then(this.onSelectResponse.bind(
                    this, sink || this.ArraySink.create()));
          }
        ]
      });

      foam.CLASS({
        package: 'foam.dao.test',
        name: 'CustomSelectRestDAO',
        extends: 'foam.dao.RestDAO',

        properties: [
          {
            class: 'Function',
            name: 'decorateSelectRequest',
            value: function(httpRequestCreatArgs) {
              return httpRequestCreatArgs;
            }
          }
        ],

        methods: [
          function select(sink, skip, limit, order, predicate) {
            var query = [];

            var networkSink = this.Serializable.isInstance(sink) && sink;
            if ( networkSink )
              query.push('sink=' + encodeURIComponent(this.jsonify_(networkSink)));

            if ( typeof skip !== 'undefined' )
              query.push('skip=' + encodeURIComponent(this.jsonify_(skip)));
            if ( typeof limit !== 'undefined' )
              query.push('limit=' + encodeURIComponent(this.jsonify_(limit)));
            if ( typeof order !== 'undefined' )
              query.push('order=' + encodeURIComponent(this.jsonify_(order)));
            if ( typeof predicate !== 'undefined' )
              query.push('predicate=' + encodeURIComponent(this.jsonify_(predicate)));

            return this.createRequest_(this.decorateSelectRequest({
              method: 'GET',
              url: this.baseURL + ':select?' + query.join('&')
            })).send().then(this.onResponse.bind(this, 'select'))
                .then(this.onSelectResponse.bind(
                    this, sink || this.ArraySink.create()));
          }
        ]
      });

      foam.CLASS({
        package: 'foam.dao.test',
        name: 'CustomSelectItem',

        properties: ['id']
      });
    });

    global.genericDAOTestBattery(function(of) {
      return serverPromise.then(function() {
        return (clientDAO = foam.dao.test.URLEncodedSelectRestDAO.create({
          of: of,
          baseURL: baseURL
        }));
      });
    });

    describe('query/payload duplication', function() {
      function qpdIt(desc, payloadFactory, select, resolve, reject) {
        it(desc, function(done) {
          serverPromise.then(function() {
            var dao = foam.dao.test.CustomSelectRestDAO.create({
              of: foam.dao.test.CustomSelectItem,
              baseURL: baseURL,
              decorateSelectRequest: function(o) {
                return Object.assign(o, {
                  payload: JSON.stringify(payloadFactory())
                });
              }
            });

            select(dao).then(resolve.bind(this, done), reject.bind(this, done));
          });
        });
      }
      function COUNT() { return foam.mlang.sink.Count.create(); }
      function ID() { return foam.dao.test.CustomSelectItem.ID; }
      function TRUE() { return foam.mlang.predicate.True.create(); }

      qpdIt(
          'responds with 400 on "sink" duplication',
          function() {
            return {
              sink: JSON.stringify(foam.json.Network.objectify((COUNT())))
            };
          },
          function(dao) { return dao.select(COUNT()); },
          function(done) {
            done.fail('Expected promise rejection');
          },
          function(done, error) {
            // TODO(markdittmer): Model errors.
            expect(error.message).toContain('400');
            done();
          });

      qpdIt(
          'responds with 400 on "skip" duplication',
          function() { return { skip: 1 }; },
          function(dao) { return dao.skip(1).select(); },
          function(done) {
            done.fail('Expected promise rejection');
          },
          function(done, error) {
            // TODO(markdittmer): Model errors.
            expect(error.message).toContain('400');
            done();
          });

      qpdIt(
          'responds with 400 on "limit" duplication',
          function() { return { limit: 1 }; },
          function(dao) { return dao.limit(1).select(); },
          function(done) {
            done.fail('Expected promise rejection');
          },
          function(done, error) {
            // TODO(markdittmer): Model errors.
            expect(error.message).toContain('400');
            done();
          });

      qpdIt(
          'responds with 400 on "order" duplication',
          function() { return { order: ID() }; },
          function(dao) { return dao.orderBy(ID()).select(); },
          function(done) {
            done.fail('Expected promise rejection');
          },
          function(done, error) {
            // TODO(markdittmer): Model errors.
            expect(error.message).toContain('400');
            done();
          });
      qpdIt(
          'responds with 400 on "predicate" duplication',
          function() { return { predicate: TRUE() }; },
          function(dao) { return dao.where(TRUE()).select(); },
          function(done) {
            done.fail('Expected promise rejection');
          },
          function(done, error) {
            // TODO(markdittmer): Model errors.
            expect(error.message).toContain('400');
            done();
          });
    });
  });
});
