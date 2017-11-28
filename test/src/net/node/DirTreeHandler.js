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

describe('DirTreeHandler', function() {
  var fs = require('fs');

  var PORT = 8888;
  var PREFIX = '/greetings';
  var DIR = `${__dirname}/data`;
  var SUFFIX1 = '/hello_world.txt';
  var SUFFIX2 = '/subdir/goodbye_world.txt';
  var PATH1 = `/greetings${SUFFIX1}`;
  var PATH2 = `/greetings${SUFFIX2}`;
  var DATA1 = fs.readFileSync(`${DIR}${SUFFIX1}`).toString();
  var DATA2 = fs.readFileSync(`${DIR}${SUFFIX2}`).toString();

  var server;
  var router;
  var serverPromise;
  var shutdownPromise = Promise.resolve(null);

  beforeEach(function() {
    server = foam.net.node.Server.create({
      port: PORT
    });
    router = foam.net.node.PathnameRouter.create(null, server);
    router.addPathnamePrefix(PREFIX, foam.net.node.DirTreeHandler.create({
      dir: DIR
    }));
    server.handler = router;

    serverPromise = shutdownPromise.then(function() {
      return server.start();
    });
  });
  afterEach(function() {
    shutdownPromise = server.shutdown();
  });

  it('should serve file based on path prefix', function(done) {
    serverPromise.then(function() {
      return foam.net.node.HTTPRequest.create({
        url: `http://0.0.0.0:${PORT}${PATH1}`
      }).send();
    }).then(function(response) {
      expect(response.status).toBe(200);
      return response.payload;
    }).then(function(payload) {
      expect(payload).toBe(DATA1);
    }).then(function() {
      return foam.net.node.HTTPRequest.create({
        url: `http://0.0.0.0:${PORT}${PATH2}`
      }).send();
    }).then(function(response) {
      expect(response.status).toBe(200);
      return response.payload;
    }).then(function(payload) {
      expect(payload).toBe(DATA2);
    }).then(done, done.fail);
  });

  it('should prohibit escape-by-relative-path', function(done) {
    serverPromise.then(function() {
      return foam.net.node.HTTPRequest.create({
        url: `http://0.0.0.0:${PORT}${PREFIX}/../DirTreeHandler.js`
      }).send();
    }).then(function(response) {
      expect(response.status).toBe(404);
    }).then(done, done.fail);
  });
});
