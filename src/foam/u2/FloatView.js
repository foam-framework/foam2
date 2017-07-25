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
  name: 'FloatView',
  extends: 'foam.u2.TextField',

  documentation: 'View for editing Float Properties.',

  axioms: [
    foam.u2.CSS.create({
      code: '^:read-only { border: none; background: rgba(0,0,0,0); }'
    })
  ],

  properties: [
    [ 'type', 'number' ],
    { class: 'Float', name: 'data' },
    'precision'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    function link() {
      this.attrSlot(null, this.onKey ? 'input' : null).relateFrom(
          this.data$,
          this.textToData.bind(this),
          this.dataToText.bind(this));
    },

    function fromProperty(p) {
      this.precision = p.precision;
    },

    function formatNumber(val) {
      if ( ! val ) return '0';
      val = val.toFixed(this.precision);
      var i = val.length - 1;
      for ( ; i > 0 && val.charAt(i) === '0' ; i-- ) {}
      return val.substring(0, val.charAt(i) === '.' ? i : i + 1);
    },

    function dataToText(val) {
      return this.precision !== undefined ?
        this.formatNumber(val) :
        '' + val ;
    },

    function textToData(text) {
      return parseFloat(text) || 0;
    }
  ]
});
