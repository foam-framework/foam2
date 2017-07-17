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

describe('shared worker registry', function() {
  var MockRegistry;
  var Registry;
  var Context;

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.box.SharedWorkerRegistry.Test',
      name: 'MockRegistry',
      extends: 'BoxRegistryBox',

      properties: [
        {
          class: 'FObjectArray',
          name: 'actions'
        }
      ],

      methods: [
        function register(name, service, box) {
          this.actions.push({
            action: 'register',
            name: name,
            service: service,
            box: box
          });
          return this.SUPER(name, service, box);
        },
        function unregister(name) {
          this.actions.push({
            action: 'unregister',
            name: name
          });
          this.SUPER(name);
        }
      ]
    });

    MockRegistry = foam.lookup('foam.box.SharedWorkerRegistry.Test.MockRegistry');
    Registry = foam.lookup('foam.box.SharedWorkerRegistry');
    Context = foam.lookup('foam.box.Context');
  });

  function ctxFactory() {
    var ctx = Context.create();
    var mockRegistry = MockRegistry.create(null, ctx);


  }
});
