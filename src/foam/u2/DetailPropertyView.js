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
  name: 'DetailPropertyView',
  extends: 'foam.u2.Element',

  documentation: 'View for one row/property of a DetailView.',

  properties: [
    'prop',
    [ 'nodeName', 'tr' ]
  ],

  css: `
    .foam-u2-PropertyView-label {
      color: #444;
      display: block;
      float: left;
      font-size: 13px;
      padding: 4px 8px 4px 8px;
      text-align: left;
      vertical-align: top;
      white-space: nowrap;
    }
    .foam-u2-PropertyView-view {
      padding: 2px 8px 2px 6px;
    }
    .foam-u2-PropertyView-units  {
      color: #444;
      font-size: 12px;
      padding: 4px;
      text-align: right;
    }
  `,

  methods: [
    function initE() {
      var prop = this.prop;

      // TODO: hide this element if the prop changes its mode to HIDDEN.
      this.
        addClass('foam-u2-PropertyView').
        start('td').addClass('foam-u2-PropertyView-label').add(prop.label).end().
        start('td').addClass('foam-u2-PropertyView-view').add(
          prop,
          prop.units && this.E('span').addClass('foam-u2-PropertyView-units').add(' ', prop.units)).
        end();
    }
  ]
});
