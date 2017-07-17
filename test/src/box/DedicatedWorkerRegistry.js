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
  var MockRegistry;
  var Registry;
  var Context;
  var LogBox;

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.box.DedicatedWorkerRegistry.Test',
      name: 'MockRegistry',
      extends: 'foam.box.BoxRegistryBox',

      properties: [
        {
          class: 'Array',
          of: 'Object',
          name: 'actions'
        }
      ],

      methods: [
        function register(name, service, box) {
          this.actions.push({
            action: 'register',
            name: name,
            service: service,
            box: box
          });
          return this.SUPER(name, service, box);
        },
        function unregister(name) {
          this.actions.push({
            action: 'unregister',
            name: name
          });
          this.SUPER(name);
        }
      ]
    });

    MockRegistry = foam.lookup('foam.box.DedicatedWorkerRegistry.Test.MockRegistry');
    Registry = foam.lookup('foam.box.DedicatedWorkerRegistry');
    Context = foam.lookup('foam.box.Context');
    LogBox = foam.lookup('foam.box.LogBox');
  });

  function ctxFactory() {
    var ctx = Context.create();
    var mockRegistry = MockRegistry.create(null, ctx);
    ctx.registry = Registry.create({
      delegate: mockRegistry,
      getDedicatedWorkerKey: function(box) {
        return box.serviceName; // Only for the purpose of these tests.
      }
    });
    return ctx;
  }

  it('should forward all registrations to delegate by default', function() {
    var ctx = ctxFactory();
    var mockRegistry = ctx.registry.delegate;

    ctx.registry.register(null, null, foam.box.LogBox.create());
    ctx.registry.register('LogBox2', null, foam.box.LogBox.create());

    expect(Object.keys(mockRegistry.registry).length).toBe(2);
    expect(mockRegistry.actions[0].action).toBe('register');
    expect(foam.box.LogBox.isInstance(mockRegistry.actions[0].box)).toBe(true);
    expect(mockRegistry.actions[1].action).toBe('register');
    expect(foam.box.LogBox.isInstance(mockRegistry.actions[1].box)).toBe(true);
  });

  it('should forward register requests of unknown services to delegate', function() {
    var ctx = ctxFactory();
    var mockRegistry = ctx.registry.delegate;

    var registryCount = function() {
      return Object.keys(ctx.registry.localRegistry.registry).length;
    }

    var dedicated = foam.box.LogBox.create();
    dedicated.serviceName = 'Box';
    var nonDedicated = foam.box.LogBox.create();

    ctx.registry.register(null, null, dedicated);
    // One register for ForkFox, one for dedicatedWorkers_
    expect(registryCount()).toBe(2);
    expect(mockRegistry.actions.length).toBe(0); // Delegate should not be hit

    ctx.registry.register('TestName', null, dedicated);
    // No reregister for ForkBox, one for dedicatedWorkers_
    expect(registryCount()).toBe(3);
    expect(mockRegistry.actions.length).toBe(0);

    ctx.registry.register(null, null, nonDedicated);
    // Verify dedicated registery was not hit
    expect(registryCount()).toBe(3);
    expect(mockRegistry.actions.length).toBe(1);

    ctx.registry.register('Test2', null, nonDedicated);
    // Verify dedicated registry was not hit
    expect(registryCount()).toBe(3);
    expect(mockRegistry.actions.length).toBe(2);
  });

  it('should send messages with services registered with dedicated registry', function(done) {
    var ctx = ctxFactory();
    var mockRegistry = ctx.registry.delegate;
    var dao = foam.dao.ArrayDAO.create({ of: 'Object' });
    var box = foam.box.SkeletonBox.create({ data: dao });
    box.serviceName = "ArrayDAO"; // Enabling dedicated service worker.

    // Perform remote registration of service.
    var register = ctx.registry.register(null, null, box);

    // Creating a stub on local for accessing method.
    var stub = foam.core.StubFactorySingleton.create().get(foam.dao.DAO)
        .create({ delegate: register }, ctx.registry.localRegistry);

    var obj = { id: 3, value: "Test" };
    stub.put(obj).then(function(ret) {
      expect(ret).toEqual(obj);
      done();
    }).catch(function(err) {
      done.fail(err);
    });
  });

  it('should send messages with services registered through delegate registry', function(done) {
    var ctx = ctxFactory();
    var mockRegistry = ctx.registry.delegate;
    var dao = foam.dao.ArrayDAO.create({ of: 'Object' });
    var box = foam.box.SkeletonBox.create({ data: dao });

    var register = ctx.registry.register(null, null, box);
    var stub = foam.core.StubFactorySingleton.create().get(foam.dao.DAO)
        .create({ delegate: register }, ctx.registry.delegate);

    var obj = { id: 3, value: "Test" };
    stub.put(obj).then(function(ret) {
      expect(ret).toBe(obj);
      done();
    });
  });

  it('should unregister non-dedicated services', function() {
    var ctx = ctxFactory();
    var mockRegistry = ctx.registry.delegate;
    var boxes = [ null, null, null ].map(function(x) {
      var box = foam.box.LogBox.create();
      return box;
    });

    var register = boxes.map(function(box, i) {
      return ctx.registry.register(`Box${i}`, null, box);
    });

    var mockCount = function() {
      return Object.keys(mockRegistry.registry).length;
    }

    // There should be 3 registration. 1 for each box above.
    expect(mockCount()).toBe(3);

    // Unregister second box, using given handle.
    ctx.registry.unregister('Box1');
    expect(mockCount()).toBe(2);

    // Unregistering a box that isn't registered should not do anything
    ctx.registry.unregister('Tester');
    expect(mockCount()).toBe(2);

    // Unregister box, given box.
    ctx.registry.unregister(register[0]);
    expect(mockCount()).toBe(1);
  });

  it('should unregister dedicated services', function(done) {
    var ctx = ctxFactory();
    var boxes = [ null, null, null ].map(function(x) {
      var box = foam.box.LogBox.create();
      box.serviceName = 'Log';
      return box;
    });

    var register = boxes.map(function(box, i) {
      return ctx.registry.register(`Box${i}`, null, box);
    });

    // There should be 4 registrations. 1 for ForkBox, 3 for boxes above.
    var names = function() {
      return Object.keys(ctx.registry.localRegistry.registry);
    }
    expect(names().length).toBe(4);

    setTimeout(function() {
      // Unregistering a box that isn't registered should not do anything.
      ctx.registry.unregister('Tester');
      expect(names().length).toBe(4);

      // Unregistering first box using box.
      ctx.registry.unregister(register[0]);
      expect(names().length).toBe(3);
      done()
    }, 4500);
  });

  it('should throw an error if registering a service with name that exists in localRegistry', function(done) {
    var ctx = ctxFactory();

    // Make a registration with dedicated and get some sort of name.
    var box = foam.box.LogBox.create();
    box.serviceName = 'Log';
    ctx.registry.register(null, null, box);
    var names = Object.keys(ctx.registry.localRegistry.registry);

    // Creating another service with an existing name, should throw.
    setTimeout(function() {
      expect(function() {
        ctx.registry.register(names[0], null, box);
      }).toThrow();
      done();
    }, 2500);
  });

  it('should throw an error if registering a service with a name that exists in delegate', function() {
    var ctx = ctxFactory();
    var mockRegistry = ctx.registry.delegate;

    // Make a registration as non-dedicated.
    var box = foam.box.LogBox.create();
    ctx.registry.register('Test', null, box);

    // Making another registration as non-dedicated with same name should error.
    expect(function() {
      ctx.registry.register('Test', null, box);
    }).toThrow();

    // Making a dedicated registration with the same name should error as well.
    box.serviceName = 'Log';
    expect(function() {
      ctx.registry.register('Test', null, box);
    }).toThrow();
  });
});
