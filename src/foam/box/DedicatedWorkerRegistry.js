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
  extends: 'foam.box.WorkerRegistry',

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
    'foam.box.NameAlreadyRegisteredException',
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
      name: 'dedicatedWorkers_',
      documentation: `Map of BoxRegistryStub used for registering box
        on the dedicated service worker.`,
      hidden: true,
      factory: function() { return {}; }
    },
  ],

  methods: [
    {
      name: 'register',
      returns: 'foam.box.Box',
      code: function(name, service, box) {
        // Perform check on name to see if it is already registered.
        this.SUPER(name, service, box);

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
      args: [ 'name', 'service', 'box' ],
    },
    {
      name: 'unregister',
      returns: '',
      code: function(nameOrBox) {
        // Forward the request to localRegistry and delegate.
        // If it does not exist, unregister does nothing.
        this.localRegistry.unregister(nameOrBox);
        this.delegate.unregister(nameOrBox);
      },
      args: [ 'name' ]
    },
    {
      name: 'send',
      returns: '',
      code: function(msg) {
        // Determine if we have a registration for box.
        // If not, forward to delegate and let it handle.
        var name = msg.object.name;
        if ( this.localRegistry.registry[name] ) {
          this.localRegistry.send(msg);
        } else {
          this.delegate.send(msg);
        }
      },
      args: [ 'msg' ]
    }
  ]
});
