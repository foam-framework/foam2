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
  extends: [ 'foam.box.BoxRegistryBox' ],

  requires: [
    'foam.core.Stub',
    'foam.box.RoundRobinBox',
    //'foam.box.node.ForkBox'
  ],

  properties: [
    {
      name: 'numSharedWorkers',
      documentation: 'The number of shared workers to be instantiated.',
      required: true,
    },
    {
      name: 'loadBalancerFactory',
      factory: function() {
        return this.RoundRobinBox.create(this.sharedWorkers_);
      }
    },
    {
      class: 'Array',
      name: 'sharedWorkers_',
      documentation: 'Array of shared service worker instances.',
      hidden: true,
      factory: function() {
        for (var i = 0; i < this.numSharedWorkers; i++) {
          var stub = this.Stub.create({ of: 'foam.box.node.ForkBox' });
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
    }
  ]
});
