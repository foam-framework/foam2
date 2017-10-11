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
  name: 'RoundRobinBox',
  implements: [ 'foam.box.Box' ],

  documentation: 'Delegates messages to box workers using round robin strategy.',

  properties: [
    {
      class: 'Array',
      of: 'foam.box.Box',
      name: 'delegates',
    },
    {
      name: 'currentBoxId_',
      value: 0,
      preSet: function(_, val) {
        return val % this.delegates.length;
      }
    }
  ],

  methods: [
    function send(message) {
      this.delegates[this.currentBoxId_++].send(message);
    }
  ]
});
