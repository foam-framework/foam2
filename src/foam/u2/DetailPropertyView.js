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

  css: `
    .foam-u2-PropertyView-label {
      color: #444;
      display: block;
      float: left;
      font-size: 15px;
      padding: 4px 32px 4px 6px;
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

  properties: [
    'prop',
    [ 'nodeName', 'tr' ],
    {
      name: 'label',
      factory: function() { return this.prop.label }
    }
  ],

  methods: [
    function initE() {
      var prop = this.prop;

      this.show(
        prop.createVisibilityFor(
          this.__context__.data$,
          this.controllerMode$).map(m => m != foam.u2.DisplayMode.HIDDEN));

      this.add(this.shown$.map(shown => {
        return this.E().
          callIf(shown, () => {
            this.addClass(this.myClass()).
            addClass('foam-u2-PropertyView').
            addClass('foam-u2-PropertyView-prop-' + prop.name).
            start('td').addClass('foam-u2-PropertyView-label').add(this.label).end().
            start('td').addClass('foam-u2-PropertyView-view').
            callIf( ! this.label, function() {
              this.style({'width': '100%'});
            }).
            add(
              prop,
              prop.units && this.E('span').addClass('foam-u2-PropertyView-units').add(' ', prop.units)).
            end();
          })
      }));
    }
  ]
});
