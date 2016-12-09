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
  package: 'foam.u2.tag',
  name: 'Input',
  extends: 'foam.u2.View',

  properties: [
    [ 'nodeName', 'input' ],
    {
      name: 'data',
      preSet: function(o, d) {
        var f = ! d || typeof d === 'string' || typeof d === 'number' || typeof d === 'boolean' || foam.Date.isInstance(d);
        if ( ! f ) {
          this.warn('Set Input data to non-primitive:' + d);
          return o;
        }
        return d;
      }
      /*
      assertValue: function(d) {
        foam.assert(! d || typeof d === 'string' || typeof d === 'number' || typeof d === 'boolean' || foam.Date.isInstance(d), 'Set Input data to non-primitive.');
      }*/
    },
    {
      class: 'Boolean',
      name: 'onKey',
      attribute: true,
      // documentation: 'When true, $$DOC{ref:".data"} is updated on every keystroke, rather than on blur.'
    },
    'type'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^:read-only { border-width: 0; }
      */}
    })
  ],

  methods: [
    function initE() {
      if ( this.type ) this.attrs({ type: this.type });
      this.cssClass(this.myCls());
      this.link();
    },

    function link() {
      // Template method, can be overriden by sub-classes
      this.attrSlot(null, this.onKey ? 'input' : null).linkFrom(this.data$);
    },

    function updateMode_(mode) {
      // TODO: make sure that DOM is updated if values don't change
      this.setAttribute('readonly', mode === foam.u2.DisplayMode.RO);
      this.setAttribute('disabled', mode === foam.u2.DisplayMode.DISABLED);
    }
  ]
});
