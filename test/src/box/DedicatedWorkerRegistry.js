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
  var Context;

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.box.DedicatedWorkerRegistry.test',
      name: 'OutputBox',
      implements: [ 'foam.box.Box' ],

      properties: [ 'key' ],

      methods: [
        function send(message) {
          var process = require('process');
          console.log(`Key: ${this.key}, Worker PID: ${process.pid}, Message: ${message}`);
        }
      ]
    });

    Registry = foam.lookup('foam.box.DedicatedWorkerRegistry');
    Context = foam.lookup('foam.box.Context');
    OutputBox = foam.lookup('foam.box.DedicatedWorkerRegistry.test.OutputBox');
  });

  it('should ...', function() {
    var firstBox = OutputBox.create({ key: 'Box1' });
    var secondBox = OutputBox.create({ key: 'Box2' });
    var ctx = Context.create();

    var registry = Registry.create({
      delegate: ctx.registry,
      getDedicatedWorkerKey: function(box) {
        return box.key;
      }
    });

    // Test code
    var ForkBox = foam.lookup('foam.box.node.ForkBox');
    var fb = ForkBox.create({ detached: false }, ctx);

    var x = registry.register(null, null, firstBox);
    var y = registry.register(null, null, secondBox);


    throw "Potato"
  });
});
