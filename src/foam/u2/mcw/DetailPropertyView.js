/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.mcw',
  name: 'DetailPropertyView',
  extends: 'foam.u2.Element',

  documentation: 'Material Design View for one row/property of a DetailView.',

  properties: [
    {
      name: 'peer_',
      factory: function() { return new mdc.formField.MDCFormField(this.el()); }
    },
    'prop'
  ],

  methods: [
    function initE() {
      var prop = this.prop;

      var id = this.NEXT_ID();

      this.
        cssClass('mdc-form-field').
        start('div').
          cssClass('mdc-textfield').
          start('input'/*prop*/, {id: id}).cssClass('mdc-textfield__input').end().
          end().
          start('label').
            cssClass('mdc-textfield__label').
            attrs({for: id}).
            add(prop.label).
          end().
        end();
    },

    function load() {
      this.SUPER();
      this.peer_.foundation_.init();
    },


  ]
});


// TODO: Add Unit support
// prop.units && this.E('span').cssClass('foam-u2-PropertyView-units').add(' ', prop.units)).
