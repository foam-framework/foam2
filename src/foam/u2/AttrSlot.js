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
  extends: 'foam.core.Slot',

  documentation: 'A Value bound to an Element attribute. Used to bind values to DOM.',

  properties: [
    {
      name: 'element',
      required: true
    },
    'value',
    [ 'property', 'value'  ],
    [ 'event',    'change' ]
  ],

  methods: [
    function get() {
      return this.element.getAttribute(this.property);
    },

    function set(value) {
      // consume redundant sets
      // if ( value == this.value ) return;

      this.element.setAttribute(this.property, value);

      // The next line is necessary to fire a change event.
      // This is necessary because DOM isn't proper MVC and
      // doesn't fire a change event when the value is explicitly set.
      this.value = value;
    },

    function sub(l) {
      var self = this;
      const valueUpdateListener = function() {
        self.set(self.get());
      };

      if ( ! this.hasListeners() ) {
        this.element.on(this.event, valueUpdateListener);
      }

      var detachable = this.SUPER('propertyChange', 'value', l);

      return {
        detach: function() {
          if ( self.hasListeners() ) {
            self.element.removeEventListener(self.event, valueUpdateListener);
          }

          detachable.detach();
        }
      };
    },

    function toString() {
      return 'AttrSlot(' + this.event + ', ' + this.property + ')';
    }
  ]
});
