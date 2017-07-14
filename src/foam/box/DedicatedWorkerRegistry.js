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
  extends: 'foam.box.ProxyBox',
  implements: [ 'foam.box.BoxRegistryBox' ],

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
    }, ctx);

    // A service that requires dedicated worker.
    var service = Service.create();
    var skBox = foam.box.SkeletonBox.create({ delegate: service });
    skBox.serviceName = "HTTPFetcher";

    // Spawns a dedicated worker, running Service.
    var register = ctx.registry.register(null, null, skBox);`,

  requires: [
    'foam.core.StubFactorySingleton',
    'foam.box.BoxRegistry',
    'foam.box.NameAlreadyRegisteredException',
    'foam.box.node.ForkBox'
  ],

  exports: [ 'as registry' ],

  constants: {
    DEDICATED: 0,
    DELEGATED: 1
  },

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
    },
    {
      name: 'localRegistry',
      documentation: 'Handles registration of all dedicated worker requests.',
      factory: function() {
        // TODO: Creating a context just to get a BoxRegistryBox seems
        // excessive. But, we cannot create a BoxRegistryBox without a context
        // at the moment.
        return foam.box.Context.create().registry;
      }
    },
    {
      name: 'dedicatedWorkers_',
      documentation: `Map of BoxRegistryStub used for registering box
        on the dedicated service worker.`,
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
    {
      name: 'getRegisteredNames',
      returns: 'Array',
      code: function() {
        return this.localRegistry.getRegisteredNames()
          .concat(this.delegate.getRegisteredNames());
      }
    },
    function register(name, service, box) {
      // Determine if this name has been registered previously.
      // TODO: Replace with .includes() once NodeJS 6+ is required
      if ( this.getRegisteredNames().indexOf(name) > -1 )
        throw this.NameAlreadyRegisteredException({ name: name });

      var key = this.getDedicatedWorkerKey(box);
      if ( ! key )
        return this.delegate.register(name, service, box);

      if ( ! this.dedicatedWorkers_[key] )
        this.dedicatedWorkers_[key] = this.stubFactory_.create({
          delegate: this.workerFactory(null, this.localRegistry)
        }, this.localRegistry);

      // Perform registration in remote box.
      return this.dedicatedWorkers_[key].register(name, service, box);
    },
    function unregister(nameOrBox) {
      // Forward the request to localRegistry and delegate.
      // If it does not exist, unregister does nothing.
      this.localRegistry.unregister(nameOrBox);
      this.delegate.unregister(nameOrBox);
    },
    function send(msg) {
      // Determine if we have a registration for box.
      // If not, forward to delegate and let it handle.
      var name = msg.object.name;
      if ( this.localRegistry.registry[name] ) {
        this.localRegistry.send(msg);
      } else {
        this.delegate.send(msg);
      }
    }
  ]
});
