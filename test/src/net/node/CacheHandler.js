/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

describe('CacheHandler', function() {
  beforeEach(function() {
    foam.CLASS({
      package: 'foam.net.node.test',
      name: 'ExampleReq',
      implements: [ 'foam.net.node.ServerRequest' ],

      properties: [
        {
          name: 'method',
          factory: function() { return 'GET'; }
        },
        {
          name: 'urlString',
          factory: function() { return 'https://example.com/'; }
        },
        {
          name: 'url',
          factory: function() {
            return require('url').URL.parse(this.urlString, true);
          }
        },
        {
          name: 'headers',
          factory: function() { return {}; }
        },
        {
          name: 'remoteAddress',
          factory: function() { return '0.0.0.0'; }
        },
        {
          name: 'payload',
          documentation: 'A promise for the request body.',
          factory: function() { return Promise.resolve(new Buffer('')); }
        }
      ],

      methods: [
        function init() {
          // No SUPER()!
        }
      ]
    });
    foam.CLASS({
      package: 'foam.net.node.test',
      name: 'HappyRes',
      implements: [ 'foam.net.node.ServerResponse' ],

      methods: [
        function getStatusCode() { return 200; },
        function setStatusCode(statusCode) {},
        function setHeader(header, value) {},
        function write(data, encoding) {},
        function end(data, encoding) {},
        function pipeFrom(stream) {}
      ]
    });
    foam.CLASS({
      package: 'foam.net.node.test',
      name: 'ErrorHandler',
      extends: 'foam.net.node.BaseHandler',

      properties: [
        {
          class: 'Int',
          name: 'statusCode',
          value: 404
        },
      ],

      methods: [
        function handle(req, res) {
          res.setStatusCode(this.statusCode);
          res.end();
          return true;
        }
      ]
    });
    foam.CLASS({
      package: 'foam.net.node.test',
      name: 'ExpectedStatusCodeRes',
      implements: [ 'foam.net.node.ServerResponse' ],

      properties: [
        {
          class: 'Int',
          name: 'statusCode',
          value: 404
        },
        {
          class: 'Int',
          name: 'expectedStatusCode',
          value: 200
        },
        {
          class: 'Function',
          name: 'done',
          value: null
        }
      ],

      methods: [
        function getStatusCode() { return this.statusCode; },
        function setStatusCode(statusCode) { this.statusCode = statusCode; },
        function setHeader(header, value) {},
        function write(data, encoding) {},
        function end(data, encoding) {
          expect(this.statusCode).toBe(this.expectedStatusCode);
          this.done && this.done();
        },
        function pipeFrom(stream) { this.end(); }
      ]
    });
    foam.CLASS({
      package: 'foam.net.node.test',
      name: 'WriteEndStrHandler',
      extends: 'foam.net.node.BaseHandler',

      methods: [
        function handle(req, res) {
          res.setStatusCode(200);
          res.write(HELLO_WORLD);
          res.end();
          return true;
        }
      ]
    });
  });

  var ctx;
  var cache;
  var manager;
  var handler;
  function setup(baseHandler, cacheSize) {
    cache = foam.dao.MDAO.create({ of: foam.net.node.CachedResponse });
    ctx = foam.__context__.createSubContext({
      defaultEntityEncoding: foam.net.node.Server.DEFAULT_DEFAULT_ENTITY_ENCODING,
      entityEncodings: foam.net.node.Server.DEFAULT_ENTITY_ENCODINGS,
      requestCacheDAO: cache
    });
    manager = foam.dao.LRUDAOManager.create({
      dao: cache,
      maxSize: cacheSize
    }, ctx);
    handler = foam.net.node.CacheHandler.create({
      delegate: baseHandler.clone(ctx)
    }, ctx);
  }

  var HELLO_WORLD = 'Hello, World\n';
  var INTERNAL_ERROR = 'Internal server error\n';
  function basicTest(baseHandler, done) {
    setup(baseHandler, 1);
    var req = foam.net.node.test.ExampleReq.create(null, ctx);
    var res = foam.net.node.test.HappyRes.create(null, ctx);

    cache.listen(foam.dao.QuickSink.create({
      putFn: function(cachedResponse) {
        expect(cachedResponse.id.indexOf(req.urlString)).toBeGreaterThan(-1);
        expect(cachedResponse.statusCode).toBe(200);
        expect(cachedResponse.headers).toEqual({});
        expect(cachedResponse.data.toString()).toBe(HELLO_WORLD);
        done();
      }
    }));

    handler.handle(req, res);
  }

  it('should cache a request from setStatusCode(), write(str), end()', function(done) {
    basicTest(foam.net.node.test.WriteEndStrHandler.create(), done);
  });

  it('should cache a request from setStatusCode(), write(buf), end()', function(done) {
    foam.CLASS({
      package: 'foam.net.node.test',
      name: 'WriteEndBufHandler',
      extends: 'foam.net.node.BaseHandler',

      methods: [
        function handle(req, res) {
          res.setStatusCode(200);
          res.write(new Buffer(HELLO_WORLD, 'utf8'));
          res.end();
          return true;
        }
      ]
    });
    basicTest(foam.net.node.test.WriteEndBufHandler.create(), done);
  });

  it('should cache a request from setStatusCode(), pipeFrom(stream)', function(done) {
    foam.CLASS({
      package: 'foam.net.node.test',
      name: 'PipeFromHandler',
      extends: 'foam.net.node.BaseHandler',

      methods: [
        function handle(req, res) {
          res.setStatusCode(200);
          var stream = new require('stream').Duplex();
          stream.push(new Buffer(HELLO_WORLD, 'utf8'));
          stream.push(null);
          res.pipeFrom(stream);
          return true;
        }
      ]
    });
    basicTest(foam.net.node.test.PipeFromHandler.create(), done);
  });


  it('should replay when result is cached', function(done) {
    // Setup ErrorHandler to fire if CacheHandler doesn't intervene.
    setup(foam.net.node.test.ErrorHandler.create({
      statusCode: 500
    }), 1);

    // Store cached response that should set statusCode=200.
    var req = foam.net.node.test.ExampleReq.create(null, ctx);
    handler.requestIdentifier.getId(req).then(function(id) {
      return cache.put(foam.net.node.CachedResponse.create({
        id: id,
        statusCode: 200
      }, ctx));
    }).then(function() {
      // Setup statusCode=200 expectation.
      var res = foam.net.node.test.ExpectedStatusCodeRes.create({
        expectedStatusCode: 200,
        done: done
      }, ctx);

      handler.handle(req, res);
    });
  });

  it('should not replay when result is not cached', function(done) {
    // Setup ErrorHandler to fire if CacheHandler doesn't intervene.
    setup(foam.net.node.test.ErrorHandler.create({
      statusCode: 500
    }), 1);

    // Setup statusCode=500 from ErrorHandler expectation.
    var req = foam.net.node.test.ExampleReq.create(null, ctx);
    var res = foam.net.node.test.ExpectedStatusCodeRes.create({
      expectedStatusCode: 500,
      done: done
    }, ctx);

    handler.handle(req, res);
  });

  it('should not replay same URL with different method', function(done) {
    // Setup ErrorHandler to fire if CacheHandler doesn't intervene.
    setup(foam.net.node.test.ErrorHandler.create({
      statusCode: 500
    }), 1);

    // Store cached response that should set statusCode=200.
    var req1 = foam.net.node.test.ExampleReq.create({
      method: 'GET'
    }, ctx);
    var req2 = foam.net.node.test.ExampleReq.create({
      method: 'PUT'
    }, ctx);
    handler.requestIdentifier.getId(req1).then(function(id) {
      // Cache req1: GET with statusCode=200.
      return cache.put(foam.net.node.CachedResponse.create({
        id: id,
        statusCode: 200
      }, ctx));
    }).then(function() {
      // Setup statusCode=500 expectation.
      var res = foam.net.node.test.ExpectedStatusCodeRes.create({
        expectedStatusCode: 500,
        done: done
      }, ctx);

      // Handle req2: PUT that falls through to statusCode=500.
      handler.handle(req2, res);
    });
  });

  it('should not replay same non-GET URL with different payloads', function(done) {
    // Setup ErrorHandler to fire if CacheHandler doesn't intervene.
    setup(foam.net.node.test.ErrorHandler.create({
      statusCode: 500
    }), 1);

    // Store cached response that should set statusCode=200.
    var req1 = foam.net.node.test.ExampleReq.create({
      method: 'PUT',
      payload: Promise.resolve('{"reqNo":1}\n')
    }, ctx);
    var req2 = foam.net.node.test.ExampleReq.create({
      method: 'PUT',
      payload: Promise.resolve('{"reqNo":2}\n')
    }, ctx);
    handler.requestIdentifier.getId(req1).then(function(id) {
      // Cache req1: PUT{"reqNo":1} with statusCode=200.
      return cache.put(foam.net.node.CachedResponse.create({
        id: id,
        statusCode: 200
      }, ctx));
    }).then(function() {
      // Setup statusCode=500 expectation.
      var res = foam.net.node.test.ExpectedStatusCodeRes.create({
        expectedStatusCode: 500,
        done: done
      }, ctx);

      // Handle req2: PUT{"reqNo":2} that falls through to statusCode=500.
      handler.handle(req2, res);
    });
  });

  it('should keep most recent entries in cache', function(done) {
    setup(foam.net.node.test.WriteEndStrHandler.create(), 3);
    var reqs = [
      foam.net.node.test.ExampleReq.create({
        urlString: 'https://example.com/0'
      }, ctx),
      foam.net.node.test.ExampleReq.create({
        urlString: 'https://example.com/2'
      }, ctx),
      foam.net.node.test.ExampleReq.create({
        urlString: 'https://example.com/3'
      }, ctx),
      foam.net.node.test.ExampleReq.create({
        urlString: 'https://example.com/4'
      }, ctx),
      foam.net.node.test.ExampleReq.create({
        urlString: 'https://example.com/5'
      }, ctx)
    ];

    var i = 0;
    cache.listen(foam.dao.QuickSink.create({
      putFn: function(cachedResponse) {
        expect(cachedResponse.id.indexOf(reqs[i].urlString))
            .toBeGreaterThan(-1);
        expect(cachedResponse.statusCode).toBe(200);
        expect(cachedResponse.data.toString()).toBe(HELLO_WORLD);

        i++;
        if ( i < reqs.length ) {
          var res = foam.net.node.test.HappyRes.create(null, ctx);
          handler.handle(reqs[i], res);
        } else {
          // Cache eviction may be async. Wait a bit before verifying number of
          // elements in cache.
          setTimeout(function() {
            cache.orderBy(foam.net.node.CachedResponse.ID).select()
                .then(function(arraySink) {
                  var array = arraySink.array;
                  expect(array.length).toBe(3);

                  expect(array[0].id.indexOf(reqs[2].urlString))
                      .toBeGreaterThan(-1);
                  expect(array[1].id.indexOf(reqs[3].urlString))
                      .toBeGreaterThan(-1);
                  expect(array[2].id.indexOf(reqs[4].urlString))
                      .toBeGreaterThan(-1);

                  array.forEach(function(cachedResponse) {
                    expect(cachedResponse.statusCode).toBe(200);
                    expect(cachedResponse.data.toString()).toBe(HELLO_WORLD);
                  });

                  done();
                });
          }, 100);
        }
      }
    }));

    var res = foam.net.node.test.HappyRes.create(null, ctx);
    handler.handle(reqs[0], res);
  });
});
