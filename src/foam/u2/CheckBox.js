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
  name: 'CheckBox',
  extends: 'foam.u2.property.AbstractCheckBox',

  documentation: 'Checkbox View.',

  css: `
    ^ {
      padding: 0px !important;
      -webkit-appearance: none;
      appearance: none;
      border-radius: 2px;
      border: solid 2px /*%GREY2%*/ #5a5a5a;
      width: 18px;
      height: 18px;
      transition: background-color 140ms, border-color 140ms;
    }
    ^:checked {
      background-color: /*%PRIMARY3%*/ #1e1f21;
      border-color: /*%PRIMARY3%*/ #1e1f21;
      fill: white;
    }
    ^:checked:after{
      position:relative;
      top:1;
      content: url("/images/checkmark-white.svg");
    }
    ^ input:focus + label::before {
      content: ''
      box-shadow: 0 0 0 3px /*%PRIMARY2%*/ #ffbf47;
    }
    ^:hover {
      cursor: pointer
    }
    ^ span, input[type='checkbox']{
      vertical-align:middle;
    }
    `,

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this
        .setAttribute('type', 'checkbox')
        .addClass(this.myClass())
        .on('click', this.onClick);

      if ( this.showLabel ) {
        this.start('label')
          .addClass(this.myClass('label'))
          .addClass(this.myClass('noselect'))
          .on('click', this.onClick)
          .callIfElse(this.labelFormatter,
            this.labelFormatter,
            function() { this.add(self.label$); }
          )
        .end();
      }
    }
  ],

  listeners: [
    function onClick() {
      if ( this.getAttribute('disabled') ) return;
      this.data = ! this.data;
    }
  ]
});
