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

describe('broadcast registry', function() {
  it('should register in all workers and round-robin messages', function(done) {
    var numWorkers = 4;
    var numMessages = 8;
    var numMessagesReceived = 0;

    // Test registry: recontextualizes newly registered boxes (as a
    // registered-over-the-network registry would).
    foam.CLASS({
      package: 'foam.box.test',
      name: 'CloneRegistry',
      extends: 'foam.box.BoxRegistryBox',

      exports: [ 'registryId' ],

      properties: [
        {
          class: 'Int',
          name: 'registryId'
        }
      ],

      methods: [
        function register(name, service, box) {
          return this.SUPER(name, service, box.clone(this));
        }
      ]
    });

    // Test messages.
    foam.CLASS({
      package: 'foam.box.test',
      name: 'Message',
      extends: 'foam.box.Message',

      properties: [
        {
          class: 'Int',
          name: 'id'
        }
      ]
    });

    // Test boxes.
    foam.CLASS({
      package: 'foam.box.test',
      name: 'CheckModBox',
      implements: ['foam.box.Box'],

      imports: [ 'registryId' ],

      methods: [
        function send(message) {
          numMessagesReceived++;
          expect(message.id % numWorkers).toBe(this.registryId);
          if ( numMessagesReceived === numMessages ) done();
        }
      ]
    });

    var baseCtx = foam.box.Context.create();

    var workerCtxs = new Array(numWorkers);
    for ( var i = 0; i < numWorkers; i++ )
      workerCtxs[i] = foam.box.Context.create();
    var workerRegistries = workerCtxs.map(function(ctx, idx) {
      return ctx.registry = foam.box.test.CloneRegistry.create({
        registryId: idx
      }, ctx);
    });

    var broadcastCtx = foam.box.Context.create();
    broadcastCtx.registry = foam.box.BroadcastRegistry.create({
      delegates: workerRegistries,
      dispatchBoxPrototype: foam.box.RoundRobinBox.create(null, broadcastCtx),
    }, broadcastCtx);

    var box = broadcastCtx.registry.register(
        'checkMod', null, foam.box.test.CheckModBox.create(
            null, broadcastCtx.__subContext__.createSubContext({
              registryId: -1
            })));
    for ( var i = 0; i < numMessages; i++ ) {
      box.send(foam.box.test.Message.create({ id: i }, broadcastCtx));
    }
  });
});
