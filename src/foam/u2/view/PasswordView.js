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
  name: 'PasswordView',
  extends: 'foam.u2.View',

  css: `
    .input-image {
      position: absolute;
      width: 24px;
      height: 24px;
      bottom: 8px;
      right: 6px;
    }
    .input-field-container {
      position: relative;
    }
    .input-field {
      padding-right: 30px;
      width: 100%;
      width: 100%;
      height: 40px;
    }
  `,

  properties: [
    ['nodeName', 'input'],
    'data',
    'type',
    {
      name: 'visibilityIcon',
      value: '/foam2/src/foam/u2/images/visibility.svg'
    },
    {
      class: 'Boolean',
      name: 'passwordInvisible',
      value: true
    },
    {
      class: 'Boolean',
      name: 'passwordIcon',
      defaultValue: false
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.addClass(this.myClass());
      this.addClass('input-field');
      this.start('img').show(this.passwordIcon$).addClass('input-image').
        attr('src', this.visibilityIcon$).on('click', this.visible).
      end();

      this.attrSlot(
        'value',
        this.onKey ? 'input' : 'change'
      ).linkFrom(this.data$);
    },

    function visibleIcon(visibilityIcon, type) {
      this.visibilityIcon = visibilityIcon;
      this.type = type;
      this.passwordInvisible = ! this.passwordInvisible;
      this.enableClass('property-password', this.passwordInvisible);
    }
  ],

  listeners: [
    function visible() {
      if ( this.passwordInvisible ) {
        //  Password visible
        this.visibleIcon('/foam2/src/foam/u2/images/visibility-off.svg',
            'text');
      } else {
        this.visibleIcon('/foam2/src/foam/u2/images/visibility.svg',
            'password');
      }
    }
  ]
});
