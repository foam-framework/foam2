/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.view',
  name: 'RadioView',
  extends: 'foam.u2.view.ChoiceView',

  requires: [
    'foam.u2.DisplayMode'
  ],

  css: `
    ^ { padding: 4px 0; }
    ^ label { position: relative; }
    ^horizontal-radio { display: flex; }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isHorizontal',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isDisabled'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      // If no item is selected, and data has not been provided, select the 0th
      // entry.
      this
        .addClass(this.myClass())
        .enableClass(this.myClass('horizontal-radio'), this.isHorizontal);

      if ( ! this.data && ! this.index ) {
        this.index = 0;
      }

      if ( this.dao ) this.onDAOUpdate();
      this.choices$.sub(this.onChoicesUpdate);
      this.onChoicesUpdate();
    },

    function updateMode_(mode) {
      this.isDisabled = mode === this.DisplayMode.RO ||
                        mode === this.DisplayMode.DISABLED;
    }
  ],

  listeners: [
    function onChoicesUpdate() {
      var self = this;
      var id;
      var index = 0;

      this.removeAllChildren();

      this.add(this.choices.map(function(c) {
        return this.E('div').
          // TODO: why is the radio item getting assigned the same class as the radio whole
          addClass(this.myClass()).
          start('input').
            attrs({
              type: 'radio',
              name: self.getAttribute('name') + 'Choice' + String.fromCharCode("A".charCodeAt(0) + (index++)),
              value: c[0],
              checked: self.slot(function (data) { return data === c[0]; }),
              disabled: self.isDisabled$
            }).
            setID(id = self.NEXT_ID()).
            on('change', function(evt) {
              self.data = c[0];
            }).
          end().
          start('label').
            attrs({for: id}).
            start('span').
              add(c[1]).
            end().
          end();
      }.bind(this)));
    }
  ]
});
