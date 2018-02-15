/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.demo',
  name: 'Demo',
  extends: 'foam.u2.Controller',
  requires: [
    'foam.nanos.demo.DemoObject'
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'demoObjectDAO'
  ],
  properties: [
    {
      class: 'Int',
      name: 'counter',
      value: 1
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.onDetach(this.demoObjectDAO.where(this.EQ(this.DemoObject.VALUE, 10)).listen({
        put: function(obj) {
          self.
            add("Object with value 10 added");
        },
        remove: function(obj) {
          self.add("Object with value 10 removed.", foam.json.stringify(obj));
        },
        reset: function() {
          self.add("reset event.");
        }
      }));

      this.add(this.CREATE_OBJECT, this.CREATE_OTHER_OBJECT, "Listening for objects.");
    }
  ],
  actions: [
    {
      name: 'createObject',
      code: function() {
        this.demoObjectDAO.put(this.DemoObject.create({ value: 10, label: 'Counter: ' + this.counter++ }));
      }
    },
    {
      name: 'createOtherObject',
      code: function() {
        this.demoObjectDAO.put(this.DemoObject.create({ value: 30, label: 'non-10 object. counter: ' + this.counter++}));
      }
    }
  ]
});
