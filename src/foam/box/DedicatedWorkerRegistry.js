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

  requires: [
    'foam.core.StubFactorySingleton',
    'foam.box.Box',
    'foam.box.node.ForkBox'
  ],

  exports: [
    'dedicatedWorkers_'
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
    },
    {
      name: "context_",
      factory: function() { return foam.box.Context.create(); }
    }
  ],

  methods: [
    function register(name, service, box) {
      var key = this.getDedicatedWorkerKey(box);
      var fork = this.ForkBox.create(null, this.context_);


      var stub = this.stubFactory_.create({ delegate: fork });
      this.dedicatedWorkers_[key] = stub;
      return stub;
    },
    function unregister(name) {
      // ???
      if ( foam.box.Box.isInstance(name) ) {
        for ( var key in this.dedicatedWorkers_ ) {
          //
          return;
        }
        return;
      }

      delete this.dedicatedWorkers_[name];
    }
  ]
});
