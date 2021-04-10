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

  requires: [ 'foam.u2.DisplayMode' ],

  css: `
    ^choice {
      display: inline-block
    }
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
      display: inline-block;
      cursor: pointer;
    }
    ^ input[type='radio']+ label:before{
      content: '';
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;
      margin-right: 0.3rem;
      border-radius: 50%;
      border-style: solid;
      border-width: 2px;
      border-color: /*%GREY2%*/ gray;
      background: transparent;
    }
    ^ input[type='radio']+ label:after{
      content: '';
      position: absolute;
      display: inline-block;
      left: 6px;
      top: 6px;
      border-radius: 50%;
      width: 12px;
      height: 12px;
    }
    ^ input[type='radio']:checked + label:after{
      background: /*%PRIMARY3%*/ blue;
    }
    ^ input[type='radio']:checked + label:before{
      border-color: /*%PRIMARY3%*/ blue;
    }
    input[type='radio']:focus + label::before {
          box-shadow: 0 0px 2px /*%PRIMARY1%*/ blue;
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
        return this.E('div').
          addClass('choice').
            callIf(this.columns != -1, function() { this.style({'flex-basis': (100 / self.columns) + '%'}) }).
          start('input').
            attrs({
              type: 'radio',
              name: self.getAttribute('name'),
              value: c[1],
              checked: self.slot(function (data) { return data === c[0]; }),
              disabled: self.isDisabled$
            }).
            setID(id = self.NEXT_ID()).
            on('change', function(evt) { self.data = c[0]; }).
          end().
          start('label').
            attrs({for: id}).
            start('span').
              add(c[1]).
            end().
          end();
      }));
    }
  ]
});
