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

  requires: [
    'foam.core.StubFactorySingleton',
    'foam.box.BoxRegistry',
    'foam.box.node.ForkBox'
  ],

  properties: [
    {
      name: "getDedicatedWorkerKey",
      value: function(box) { return null; }
    },
    {
      name: "dedicatedWorkers_",
      factory: function() { return {}; }
    },
    {
      name: 'stubFactory_',
      factory: function() {
        return this.StubFactorySingleton.create().get(this.BoxRegistry);
      }
    },
    {
      name: 'registry',
      expression: function(delegate) {
        return this.delegate.registry;
      }
    }
  ],

  methods: [
    function register(name, service, box) {
      var key = this.getDedicatedWorkerKey(box);
      if ( ! key ) return this.delegate.register(name, service, box);
      if ( ! this.dedicatedWorkers_[key] )
        this.dedicatedWorkers_[key] = this.stubFactory_.create({
          delegate: this.ForkBox.create(null, this)
        }, this);

      return this.dedicatedWorkers_[key].register(name, service, box);
    },
    function unregister(name) {
      if ( foam.box.Box.isInstance(name) ) {
        var key = this.getDedicatedWorkerKey(name);
        if ( ! key ) this.delegate.unregister(name);

        for ( var key in this.dedicatedWorkers_ ) {
          if (  this.dedicatedWorkers_[key] === name ) {
            delete this.dedicatedWorkers_[key];
            return;
          }
        }
        return;
      }

      if ( this.dedicatedWorkers_[name] ) {
        delete this.dedicatedWorkers_[name];
      } else {
        this.delegate.unregister(name);
      }
    },
  ]
});
