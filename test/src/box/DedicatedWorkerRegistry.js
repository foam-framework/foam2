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

    foam.CLASS({
      package: 'foam.box.DedicatedWorkerRegistry.Test',
      name: 'MockRegistry',
      extends: 'foam.box.BoxRegistry',

      properties: [
        {
          class: 'Array',
          of: 'FObject',
          name: 'actions'
        }
      ],

      methods: [
        function register(name, service, localBox) {
          this.actions.push({
            action: 'register',
            name: name,
            service: service,
            box: localBox
          });

          // Copied code...
          name = name || foam.next$UID();

          var exportBox = this.SubBox.create({ name: name, delegate: this.me });
          exportBox = service ? service.clientBox(exportBox) : exportBox;

          this.registry[name] = {
            exportBox: exportBox,
            localBox: service ? service.serverBox(localBox) : localBox
          };

          return this.registry[name].exportBox;
        },
        function unregister(name) {
          this.actions.push({
            action: 'unregister',
            name: name
          });
        },
        function send(msg) {
          return new Promise(function(resolve, reject) {
            resolve("This was sent from mock registry!");
          });
        }
      ]
    });

    MockRegistry = foam.lookup('foam.box.DedicatedWorkerRegistry.Test.MockRegistry');
    Registry = foam.lookup('foam.box.DedicatedWorkerRegistry');
    Context = foam.lookup('foam.box.Context');
    LogBox = foam.lookup('foam.box.LogBox');
    PIDBox = foam.lookup('foam.box.PIDBox'); // Only available during testing
  });

  it('should forward all registrations to delegate by default', function() {
    var ctx = Context.create();
    var mockRegistry = MockRegistry.create(null, ctx);

    var registry = Registry.create({
      delegate: mockRegistry
    }, ctx);

    registry.register(null, null, foam.box.LogBox.create());
    registry.register('LogBox2', null, foam.box.LogBox.create());

    expect(mockRegistry.actions.length).toBe(2);
    expect(mockRegistry.actions[0].action).toBe('register');
    expect(foam.box.LogBox.isInstance(mockRegistry.actions[0].box)).toBe(true);
    expect(mockRegistry.actions[1].action).toBe('register');
    expect(foam.box.LogBox.isInstance(mockRegistry.actions[1].box)).toBe(true);
  });

  it('should forward register requests of unknown services to delegate', function() {
    var ctx = Context.create();
    var mockRegistry = MockRegistry.create(null, ctx);

    var registry = Registry.create({
      delegate: mockRegistry,
      getDedicatedWorkerKey: function(box) {
        return box.serviceName;
      }
    }, ctx);

    var registryCount = function() {
      return Object.keys(registry.registry.registry).length;
    }

    var dedicated = foam.box.LogBox.create();
    dedicated.serviceName = 'Box';
    var nonDedicated = foam.box.LogBox.create();

    registry.register(null, null, dedicated);
    // One register for ForkFox, one for dedicatedWorkers_
    expect(registryCount()).toBe(2);
    expect(mockRegistry.actions.length).toBe(0); // Delegate should not be hit

    registry.register('TestName', null, dedicated);
    // No reregister for ForkBox, one for dedicatedWorkers_
    expect(registryCount()).toBe(3);
    expect(mockRegistry.actions.length).toBe(0);

    registry.register(null, null, nonDedicated);
    // Verify dedicated registery was not hit
    expect(registryCount()).toBe(3);
    expect(mockRegistry.actions.length).toBe(1);

    registry.register('Test2', null, nonDedicated);
    // Verify dedicated registry was not hit
    expect(registryCount()).toBe(3);
    expect(mockRegistry.actions.length).toBe(2);
  });

  it('should route messages to the dedicated service', function(done) {
    var ctx = Context.create();
    var mockRegistry = MockRegistry.create(null, ctx);

    var registry = Registry.create({
      delegate: mockRegistry, // Default registry
      getDedicatedWorkerKey: function(box) {
        return box.serviceName;
      }
    }, ctx);

    var dao = foam.dao.ArrayDAO.create();
    var box = foam.box.SkeletonBox.create({ data: dao });
    // Setting box service name for dedicated worker registry.
    box.serviceName = "ArrayDAO";

    var register = registry.register(null, null, box);
    var stub = foam.core.StubFactorySingleton.create().get(foam.dao.DAO)
        .create({ delegate: register }, ctx);

    var obj = { id: 3, value: "Test" };
    stub.put(obj).then(function(ret) {
      expect(ret).toEqual(obj);
      done();
    });
  });

  it('should route messages to delegate service', function(done) {
    var ctx = Context.create();
    var mockRegistry = MockRegistry.create(null, ctx);

    var registry = Registry.create({
      delegate: mockRegistry, // Default registry
      getDedicatedWorkerKey: function(box) {
        return box.serviceName;
      }
    }, ctx);

    var dao = foam.dao.ArrayDAO.create();
    var box = foam.box.SkeletonBox.create({ data: dao });

    var register = registry.register(null, null, box);
    var stub = foam.core.StubFactorySingleton.create().get(foam.dao.DAO)
        .create({ delegate: register }, ctx);

    var obj = { id: 3, value: "Test" };
    stub.put(obj).then(function(ret) {
      expect(ret).toBe("This was sent from mock registry!");
    });
  });

  it('should unregister dedicated services', function() {
  });

  it('should forward unregister of unknown services to delegate', function() {
  });
});
