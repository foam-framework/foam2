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

// TODO: Add datalist support.

foam.CLASS({
  package: 'foam.u2',
  name: 'DateView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing Date values.',

  css: '^:read-only { border: none; background: rgba(0,0,0,0); }',

  axioms: [
    { class: 'foam.u2.TextInputCSS' }
  ],

  properties: [
    [ 'placeholder', 'yyyy-mm-dd' ]
  ],

  listeners: [
    {
      name: 'onBlur',
      isFramed: true,
      code: function() {
        if ( ! this.el() ) return;
        this.el().value = this.dataToInput(this.data);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'date');
      this.setAttribute('max', '9999-12-31');
      this.setAttribute('placeholder', 'yyyy/mm/dd');
      this.on('blur', this.onBlur);
    },

    function link() {
      this.data$.relateTo(
          this.attrSlot(null, this.onKey ? 'input' : null),
          d => this.dataToInput(d),
          d => this.inputToData(d)
      );
    },

    function inputToData(input) {
      var d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    },

    function dataToInput(data) {
      if ( ! data ) return data;

      // Using our own formatter to keep the date in the format (yyyy-mm-dd) while maintaining the locale date
      const year = data.getUTCFullYear();
      const month = (data.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = data.getUTCDate().toString().padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
  ]
});
