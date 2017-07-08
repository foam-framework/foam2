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
    'foam.box.Box',
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
        return this.StubFactorySingleton.create().get(this.ForkBox);
      }
    }
  ],

  methods: [
    function register(name, service, box) {
      var key = this.getDedicatedWorkerKey(box);

      // What context is this being spawned in?
      var fork = this.ForkBox.create(null);

      var reg = this.delegate.register(name, service, box);
      var stub = this.stubFactory_.create({ delegate: fork });
      this.dedicatedWorkers_[key] = stub;

      return stub;
    },
    function unregister(name) {
      this.delegate.unregister(name);

      if ( foam.box.Box.isInstance(name) ) {
        for ( var key in this.dedicatedWorkers_ ) {
          if ( this.dedicatedWorkers_[key] === name ) {
            delete this.dedicatedWorkers_[key];
            return;
          }
        }
        return;
      }
      delete this.dedicatedWorkers_[name];
    }
  ]
});
