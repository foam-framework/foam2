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
  name: 'IntView',
  extends: 'foam.u2.TextField',

  css: '^:read-only:not(^:disabled) { border: none; background: rgba(0,0,0,0); }',

  properties: [
    [ 'type', 'number' ],
    { class: 'Int', name: 'data' },
    'min',
    'max'
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.min != undefined ) this.setAttribute('min', this.min);
      if ( this.max != undefined ) this.setAttribute('max', this.max);
    },

    function link() {
      this.attrSlot(null, this.onKey ? 'input' : null).linkFrom(this.data$)
    },

    function fromProperty(p) {
      this.SUPER(p);
      this.min = p.min;
      this.max = p.max;
    }
  ]
});
