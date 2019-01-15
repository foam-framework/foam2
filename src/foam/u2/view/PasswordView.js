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
    ^ .input-field-container {
      position: relative;
    }
    ^ .input-image {
      position: absolute;
      width: 24px;
      height: 24px;
      bottom: 8px;
      right: 6px;
    }
    ^ .input-field {
      padding-right: 30px;
    }
  `,

  constants: [
    {
      type: 'String',
      name: 'VISIBILITY',
      value: '/foam2/src/foam/u2/images/visibility.svg'
    },
    {
      type: 'String',
      name: 'VISIBILITY_OFF',
      value: '/foam2/src/foam/u2/images/visibility-off.svg'
    }
  ],

  properties: [
    {
      name: 'visibilityIcon',
      factory: function() {
        return this.VISIBILITY_OFF;
      }
    },
    {
      class: 'Boolean',
      name: 'passwordInvisible',
      value: true
    },
    {
      class: 'Boolean',
      name: 'passwordIcon'
    },
    {
      class: 'String',
      name: 'type',
      value: 'password'
    },
    'inputElement'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.addClass(this.myClass()).start().
        addClass('input-field-container').
        start(foam.u2.tag.Input, {
          type: this.type,
          data$: this.data$,
          onKey: true
        }, this.inputElement$).
        addClass('input-field').addClass('full-width-input-password').end().
        start('img').show(this.passwordIcon$).addClass('input-image').
        attr('src', this.visibilityIcon$).on('click', this.visible).
        end().
      end();
    },

    function visibleIcon(visibilityIcon, type) {
      this.visibilityIcon = visibilityIcon;
      this.inputElement.setAttribute('type', type);
      this.passwordInvisible = ! this.passwordInvisible;
      this.enableClass('property-password', this.passwordInvisible);
    }
  ],

  listeners: [
    function visible() {
      if ( this.passwordInvisible ) {
        // Make password visible
        this.visibleIcon(this.VISIBILITY, 'text');
      } else {
        // Make password invisible
        this.visibleIcon(this.VISIBILITY_OFF, 'password');
      }
    }
  ]
});
