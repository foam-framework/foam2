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

  requires: [ 'foam.u2.DisplayMode', 'foam.u2.tag.CircleIndicator' ],
  imports: ['theme'],
  css: `
    /*hide default input*/
    ^ input[type='radio']{
      padding: 0px !important;
      -webkit-appearance: none;
      appearance: none;
      border: none;
      opacity: 0.0001;
      vertical-align: middle;
    }
    ^ input[type='radio']+ label{
      position: relative;
      display: flex;
      cursor: pointer;
      align-items: center;
    }

    ^ *,
    *:before,
    *:after {
      box-sizing: border-box;
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

    /* Primary Styling */
    ^radio-inner{
      content: '';
      width: 100%;
      height: 100%;
      box-shadow: inset 0.5em 0.5em /*%PRIMARY3%*/ blue;
      background: /*%PRIMARY3%*/ blue;
      border-radius: 50%;
      transition: 180ms transform ease;
      transform: scale(0);
    }
    ^radio-outer{
      content: '';
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      width: 1em;
      height: 1em;
      border-radius: 50%;
      border: 2px solid;
      border-color: /*%GREY2%*/ gray;
      margin-right: 0.3em;
      transform: scale(1);
      transition: border-color ease 280ms;
    }

    /*Selected*/
    ^radio-inner.checked{
      transform: scale(0.5);
    }
    ^radio-outer.checked {
      border-color: /*%PRIMARY3%*/ blue;
    }

    /* Disabled */
    ^radio-outer.disabled{
      border-color: /*%GREY4%*/ gray;
    }

    /* Focus */
    ^ input[type='radio']:focus + label > ^radio-outer{
      box-shadow: 0 0px 2px /*%PRIMARY1%*/ blue;
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
        var isChecked$ = self.slot(function(data) { return data == c[0]; });
        return this.E('div').
          addClass('choice').
            callIf(this.columns != -1, function() { this.style({'flex-basis': (100 / self.columns) + '%'}) }).
          start('input').
            attrs({
              type: 'radio',
              name: self.getAttribute('name') + self.$UID,
              value: c[1],
              checked: isChecked$,
              disabled: self.isDisabled$
            }).
            setID(id = self.NEXT_ID()).
            on('change', function(evt) { self.data = c[0]; }).
          end().
          start('label').
            attrs({for: id}).
            start().
              addClass(this.myClass('radio-outer')).
              enableClass('disabled', self.isDisabled$).
              enableClass('checked', isChecked$).
              start().
                addClass(this.myClass('radio-inner')).
                enableClass('disabled', self.isDisabled$).
                enableClass('checked', isChecked$).
              end().
            end().
            start('span').
              add(c[1]).
            end().
          end();
      }));
    }
  ]
});
