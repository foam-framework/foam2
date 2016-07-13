/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'AttrSlot',
  implements: [ 'foam.core.Slot' ],

  // documentation: 'A Value bound to an Element attribute. Used to bind values to DOM.',

  properties: [
    {
      name: 'element',
      required: true
    },
    [ 'property',       'value'  ],
    [ 'event',          'change' ],
    [ 'firstListener_', true     ]
  ],

  methods: [
    function get() {
      return this.element.getAttribute(this.property);
    },

    function set(value) {
      this.element.setAttribute(this.property, value);
    },

    function sub(l) {
      this.element.on(this.event, l);
      return {
        destroy: function() { this.unsub(l); }.bind(this)
      };
    },

    function unsub(l) {
      this.element.on(this.event, l);
    },

    function toString() {
      return 'AttrSlot(' + this.event + ', ' + this.property + ')';
    }
  ]
});
