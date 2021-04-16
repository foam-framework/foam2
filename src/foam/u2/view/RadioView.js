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

  requires: [ 'foam.u2.DisplayMode', 'foam.u2.view.RadioButton' ],

  css: `
    /*hide default input*/
    ^ input[type='radio']{
      padding: 0px !important;
      -webkit-appearance: none;
      appearance: none;
      border: none;
      vertical-align: middle;
    }
    ^ input[type='radio']+ label{
      position: relative;
      display: flex;
      cursor: pointer;
      align-items: center;
    }
    ^ .choice {
      font-size: 16px;
      margin-bottom: 16px;
      white-space: nowrap;
    }
    ^horizontal-radio {
      align-content: center;
      align-items: center;
      display: flex;
      flex-wrap: wrap;
    }
    ^ span{
      vertical-align: middle;
    }
    ^radio-outer{
      margin-right: 0.4em;
      border-radius: 50%;
    }
    /* Focus */
    ^ input[type='radio']:focus + label > ^radio-outer > .radio{
      filter: drop-shadow( 0px 0px 1px rgba(0, 0, 0, .5));
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isHorizontal'
    },
    {
      class: 'Boolean',
      name: 'isDisabled'
    },
    {
      class: 'Int',
      name: 'columns',
      value: 3
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
      this.isDisabled =
        mode === this.DisplayMode.RO || mode === this.DisplayMode.DISABLED;
    }
  ],

  listeners: [
    function onChoicesUpdate() {
      var self = this;
      var id;
      var index = 0;

      this.removeAllChildren();

      this.add(this.choices.map(c => {
        var isChecked = self.slot(function(data) { return data == c[0]; });
        return this.E('div').
          addClass('choice').
            callIf(this.columns != -1, function() { this.style({'flex-basis': (100 / self.columns) + '%'}) }).
          start('input').
            attrs({
              type: 'radio',
              name: self.getAttribute('name') + self.$UID,
              value: c[1],
              checked: isChecked,
              disabled: self.isDisabled$
            }).
            setID(id = self.NEXT_ID()).
            on('change', function(evt) { self.data = c[0]; }).
          end().
          start('label').
            attrs({for: id}).
            start().
              addClass(this.myClass('radio-outer')).
              add(this.RadioButton.create({ isSelected$: isChecked, isDisabled$: self.isDisabled$ })).
            end().
            start('span').
              add(c[1]).
            end().
          end();
      }));
    }
  ]
});
