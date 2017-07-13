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

foam.CLASS({
  package: 'foam.box',
  name: 'DedicatedWorkerRegistry',
  extends: 'foam.box.BoxRegistryBox',
  implements: [ 'foam.box.ProxyBox' ],

  documentation: `A registry used to manage dedicated worker instances. The
    registry will instantiate a worker for services that require dedicate
    worker instances. A dedicated worker will be provided for the service if
    'getDedicatedWorkerKey' returns a non-null value. Otherwise, the
    registration request is passed to the delegate.

    Example usage:
    var ctx = foam.box.Context.create();
    ctx.registry = Registry.create({
      delegate: ctx.registry,
      getDedicatedWorkerKey: function(box) {
        return box.serviceName;
      }
    }, ctx.registry);

    // A service that requires dedicated worker.
    var service = Service.create();
    var skBox = foam.box.SkeletonBox.create({ delegate: service });
    skBox.serviceName = "HTTPFetcher";

    // Spawns a dedicated worker, running Service.
    var register = ctx.registry.register(null, null, skBox);`,

  requires: [
    'foam.core.StubFactorySingleton',
    'foam.box.BoxRegistry',
    'foam.box.node.ForkBox'
  ],

  exports: [ 'as registry' ],

  properties: [
    {
      class: 'Function',
      name: "getDedicatedWorkerKey",
      documentation: `Gets the service name from the provided box.
        If the value is not null, a dedicated worker will be used for the box.
        Otherwise, the registration request will be forwarded to the delegate.`,
      value: function(box) { return null; },
    },
    {
      class: 'Function',
      name: 'workerFactory',
      documentation: 'Used to generate the dedicated workers.',
      value: function(args, ctx) {
        return this.ForkBox.create(args, ctx);
      }
    },
    {
      class: 'Proxy',
      of: 'foam.box.Box',
      name: 'delegate',
      documentation: 'Handles all non-dedicated worker requests.',
      required: true,
      //factory: function() { return this.registry; }
    },
    {
      name: 'dedicatedWorkers_',
      documentation: `Map of BoxRegistryStub used for registering box
        on the dedicated service worker.`,
      factory: function() { return {}; }
    },
    {
      name: 'registeredNames_',
      documentation: `Map of the names of registrations and whether the
        box was registered under dedicated registry or delegate registry.`,
      factory: function() { return {}; }
    },
    {
      name: 'stubFactory_',
      documentation: `A factory to generate BoxRegistryStubs when instantiating
        a dedicated worker.`,
      factory: function() {
        return this.StubFactorySingleton.create().get(this.BoxRegistry);
      }
    }
  ],

  methods: [
    function register(name, service, box) {
      var key = this.getDedicatedWorkerKey(box);
      if ( ! key ) {
        return this.delegate.register(name, service, box);
      }

      // Redirecting all registers of following statements with our registry.
      // If this is not done, this register method will be called recursively,
      // and registrations will be forwarded to delegate.
      var oldReg = this.register;
      this.register = this.SUPER;

      if ( ! this.dedicatedWorkers_[key] )
        this.dedicatedWorkers_[key] = this.stubFactory_.create({
          delegate: this.workerFactory(null, this)
        }, this);

      var ret = this.dedicatedWorkers_[key].register(name, service, box);

      // Register is set back to this method for future calls.
      this.register = oldReg;
      return ret;
    },
    function unregister(name) {
      // Attempt to unregister in our registry, then delegate registry
      this.SUPER(name);
      this.delegate.unregister(name);
    },
    function send(msg) {
      // Determine if we have a registration for box.
      // If not, forward to delegate and let it handle.
      if ( this.SubBoxMessage.isInstance(msg.object) ) {
        var name = msg.object.name;
        if ( this.registry[name] && this.registry[name].localBox ) {
          this.SUPER(msg);
          return;
        }
      }
      this.delegate.send(msg);
    }
  ]
});
