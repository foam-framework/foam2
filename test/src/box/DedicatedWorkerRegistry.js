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

describe('dedicated worker registry', function() {
  var Registry;
  var OutputBox;
  var PIDBox;
  var Context;

  beforeEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 2147483647;

    // Refining LogBox to our uses since the portable box
    // needs to be defined for child as well...
    foam.CLASS({
      refines: 'foam.box.LogBox',

      properties: [
        {
          name: 'results',
          factory: function() { return {}; }
        }
      ],

      methods: [
        function send(msg) {
          var sender = msg.attributes.sender;
          results[sender] = msg.object;
        }
      ]
    });

    Registry = foam.lookup('foam.box.DedicatedWorkerRegistry');
    Context = foam.lookup('foam.box.Context');
    LogBox = foam.lookup('foam.box.LogBox');
    PIDBox = foam.lookup('foam.box.PIDBox'); // Only available during testing
  });

  it('should ...', function(done) {
    // Local context and registry
    var ctx = Context.create();
    var recvBox = LogBox.create({ name: 'RecvBox' });

    var skBox = foam.box.SkeletonBox.create({ delegate: recvBox });
    var portableBox = ctx.registry.register(null, null, skBox);

    ctx.registry = Registry.create({
      delegate: ctx.registry, // Default registry
      getDedicatedWorkerKey: function(box) {
        return box.name;
      }
    }, ctx);

    // Registering service in remote processes
    var firstBox = PIDBox.create({ name: 'Box1' });
    var secondBox = PIDBox.create({ name: 'Box2' });

    var first = ctx.registry.register(null, null, firstBox);
//    var second = ctx.registry.register(null, null, secondBox);


    // Sending message to child processes
    var firstMsg = 'This is the first test';
    var secondMsg = 'This is the second test';
    first.send(foam.box.Message.create({ object: { message: firstMsg, portableBox: portableBox } }));
//    second.send(foam.box.Message.create({ object: { message: secondMsg, portableBox: skBox } }));

    setTimeout(function() {
      expect(Object.keys(recvBox).length).toBeGreaterThan(0);
      //expect(recvBox.results['Box1']).toBeDefined();
      //expect(recvBox.results['Box2']).toBeDefined();

      //done();
    }, 10000);
  });
});
