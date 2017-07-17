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
  name: 'SharedWorkerRegistry',
  extends: 'foam.box.ProxyBox',
  implements: [ 'foam.box.BoxRegistryBox' ],

  documentation: `A registry used to manage shared worker instances. The
    registry will instantiate a specified number of worker instances. Upon
    registration, the service will be registered with all worker instances.

    Example usage:
    <To be included later>`,

  requires: [
    'foam.box.NameAlreadyRegisteredException',
    'foam.box.RoundRobinBox',
    'foam.box.node.ForkBox'
  ],

  exports: [ 'as registry' ],

  properties: [
    {
      class: 'Int',
      name: 'numSharedWorkers',
      documentation: 'The number of shared workers to be instantiated.',
      required: true,
    },
    {
      class: 'Function',
      name: 'loadBalancerFactory',
      documentation: `Generates the load balancer which is used to forward
        units of work to worker instances.`,
      value: function(workers) {
        return this.RoundRobinBox.create(workers);
      }
    },
    {
      class: 'Array',
      name: 'sharedWorkers_',
      documentation: 'Array of shared service worker instances.',
      hidden: true,
      factory: function() {
        for ( var i = 0; i < this.numSharedWorkers; i++ ) {
          var stub = this.stubFactory_.create({
            delegate: this.workerFactory(null, this.localRegistry)
          }, this.localRegistry);
          this.sharedWorkers_.push(stub);
        }
      }
    },
  ],

  methods: [
    {
      name: 'register',
      returns: 'foam.box.Box',
      code: function(name, service, box) {
        // Perform check on name to see if it is already registered.
        this.SUPER(name, service, box);

        var workers = this.sharedWorkers_.map(function(worker) {
          return worker.register(name, service, box);
        });
        return this.loadBalancerFactory(workers);
      }
    },
    {
      name: 'unregister',
      returns: '',
      code: function(name) {
        this.sharedWorkers_.forEach(function(worker) {
          worker.unregister(name);
        });
      }
    },
    {
      name: 'send',
      code: function(msg) {
        // I'm actually not too sure what this would do...
        // If registry contains destination, we send it to one of our workers.
        // Otherwise, forward request to delegate.
      }
    }
  ]
});
