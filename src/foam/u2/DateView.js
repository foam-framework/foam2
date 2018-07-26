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

  properties: [
    [ 'placeholder', 'yyyy-mm-dd' ]
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'date');
    },

    function link() {
      this.data$.relateTo(
          this.attrSlot(null, this.onKey ? 'input' : null),
          function(date) {
            return date ? date.toISOString().substring(0,10) : date;
          },
          function(value) {
            return new Date(value);
          }
      );
    }
  ]
});
