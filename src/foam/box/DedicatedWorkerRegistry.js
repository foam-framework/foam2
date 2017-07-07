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
  extends: [ 'foam.box.BoxRegistryBox' ],

  requires: [
    'foam.core.Stub',
    'foam.box.node.ForkBox'
  ],

  properties: [
    {
      name: "dedicatedWorkers_",
      factory: function() { return {}; }
    },
    {
      name: "getDedicatedWorkerKey",
      value: function(box) { return null; }
    }
  ],

  methods: [
    function register(name, service, box) {
      var key = this.getDedicatedWorkerKey(box);
      var stub = this.Stub.create({ of: 'foam.box.node.ForkBox' });

      stub.register(name, service, box);
      dedicatedWorkers[key] = stub;
      return stub;
    },
    function unregister(name) {
      // ???
    }
  ]
});
