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
  name: 'ElementSlot',
  implements: [ 'foam.core.Slot' ],

  // documentation: 'A Value bound to an Element attribute. Used to bind values to DOM.',

  properties: [
    [ 'property', 'value' ],
    [ 'event', 'change' ],
    [ 'firstListener_', true ],
    {
      name: 'element',
      required: true
    },
    {
      name: 'value',
      postSet: function(_, value) {
        this.element.setAttribute(this.property, value);
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.onAttrValueChange();
    },

    function get() { return this.value; },

    function set(value) {
      this.value = value;
      this.element.pub('attributeChange', this.property, value);
    },

    function sub(l) {
      console.log('sub ' + this.property);
      if ( this.firstListener_ ) {
        if ( this.event ) {
          this.element.on(this.event, this.onAttrValueChange, false);
        }

        this.firstListener_ = false;
      }
      return this.element.sub('attributeChange', this.property, l);
    },

    function unsub(l) {
      this.element.unsub('attributeChange', this.property, l);
    },

    function toString() {
      return 'ElementSlot(' + this.event + ', ' + this.property + ')';
    }
  ],

  listeners: [
    {
      name: 'onAttrValueChange',
      code: function() {
        this.value = this.element.getAttribute(this.property) ;
      }
    }
  ]
});
