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

describe('FileHandler', function() {
  var fs = require('fs');

  var PORT = 8888;
  var PATHNAME1 = '/greetings/hello';
  var PATHNAME2 = '/greetings/goodbye';
  var FILE1 = `${__dirname}/data/hello_world.txt`;
  var FILE2 = `${__dirname}/data/subdir/goodbye_world.txt`;
  var DATA1 = fs.readFileSync(FILE1).toString();
  var DATA2 = fs.readFileSync(FILE2).toString();

  var server;
  var router;
  var serverPromise;
  var shutdownPromise = Promise.resolve(null);

  beforeEach(function() {
    server = foam.net.node.Server.create({
      port: PORT
    });
    router = foam.net.node.PathnameRouter.create(null, server);
    router.addPathname(PATHNAME1, foam.net.node.FileHandler.create({
      filePath: FILE1
    }));
    router.addPathname(PATHNAME2, foam.net.node.FileHandler.create({
      filePath: FILE2
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
        url: `http://0.0.0.0:${PORT}${PATHNAME1}`
      }).send();
    }).then(function(response) {
      expect(response.status).toBe(200);
      return response.payload;
    }).then(function(payload) {
      expect(payload).toBe(DATA1);
    }).then(function() {
      return foam.net.node.HTTPRequest.create({
        url: `http://0.0.0.0:${PORT}${PATHNAME2}`
      }).send();
    }).then(function(response) {
      expect(response.status).toBe(200);
      return response.payload;
    }).then(function(payload) {
      expect(payload).toBe(DATA2);
    }).then(done).catch(done.fail);
  });
});
