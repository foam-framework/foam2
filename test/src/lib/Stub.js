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

describe('Stub', function() {
  it('should support stubbing remote registry and registered service', function(done) {
    require('./StubShared.js');

    var sf = foam.core.StubFactorySingleton.create();
    var ctx = foam.box.Context.create();

    // Stub out registry in forked process.
    var remoteRegistry = sf.get(foam.box.BoxRegistry).create({
      delegate: foam.box.node.ForkBox.create({
        critical: true,
        childScriptPath: `${__dirname}/StubForkScript.js`
      }, ctx)
    }, ctx);

    // Register skeleton for "Square" service (in StubShared.js).
    var squareSkeleton = foam.box.SkeletonBox.create({
      data: test.Square.create()
    });
    // Stub registered box.
    var squareStub = sf.get(test.Square).create({
      delegate: remoteRegistry.register('square', null, squareSkeleton)
    }, ctx);

    // Confirm that service invocation works as expected.
    squareStub.square(2).then(function(four) {
      expect(four).toBe(4);
      done();
    });
  });
});
