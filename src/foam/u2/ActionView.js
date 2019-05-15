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
  package: 'foam.u2',
  name: 'ActionView',
  extends: 'foam.u2.Element',

  documentation: `
    A button View for triggering Actions.

    Icon Fonts
    If using icon-fonts a css stylesheet link to the fonts is required in index.html.
    The default of foam.core.Action.js is 'Material Icons' supported by the following
    link: <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
  `,

  requires: [
    'foam.u2.ButtonSize',
    'foam.u2.ButtonStyle'
  ],

  css: `
    ^ {
      border-radius: 3px;
      text-align: center;
      display: inline-block;
      border: 1px solid transparent;
    }

    ^ + ^ {
      margin-left: 8px;
    }

    ^ img {
      margin-right: 4px;
    }

    ^:focus {
      border-width: 2px;
    }

    ^:hover:not(:disabled) {
      cursor: pointer;
    }

    ^unavailable {
      display: none;
    }

    ^ img {
      vertical-align: middle;
    }

    ^.material-icons {
      cursor: pointer;
    }


    /*
     * Primary
     */

    ^primary {
      border-color: #355bc4;
      background-color: %SECONDARYCOLOR%;
      color: white;
    }

    ^primary:hover:not(:disabled) {
      border-color: #294798;
      background-color: %SECONDARYHOVERCOLOR%;
    }

    ^primary:focus {
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary:disabled {
      border-color: %SECONDARYDISABLEDCOLOR%;
      background-color: %SECONDARYDISABLEDCOLOR%;
    }

    ^primary-destructive {
      border-color: %DESTRUCTIVECOLOR%;
      background-color: %DESTRUCTIVECOLOR%;
      color: white;
    }

    ^primary-destructive:hover:not(:disabled) {
      border-color: #a61414;
      background-color: %DESTRUCTIVEHOVERCOLOR%;
    }

    ^primary-destructive:focus {
      border-color: #a61414;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary-destructive:disabled {
      border-color: #ed8e8d;
      background-color: %DESTRUCTIVEDISABLEDCOLOR%;
    }


    /*
     * Secondary
     */

    ^secondary {
      border-color: #cbcfd4;
      background-image: linear-gradient(to bottom, #ffffff, #e7eaec);
      color: %PRIMARYCOLOR%;
    }

    ^secondary:hover {
      border-color: #cbcfd4;
      background-image: linear-gradient(to bottom, #ffffff, #d3d6d8);
      color: %PRIMARYHOVERCOLOR%;
    }

    ^secondary:focus {
      background-image: linear-gradient(to bottom, #ffffff, #d3d6d8);
      border-color: %SECONDARYCOLOR%;
    }

    ^secondary:disabled {
      border-color: #e7eaec;
      color: %PRIMARYDISABLEDCOLOR%;
    }

    ^secondary-destructive {
      border-color: %DESTRUCTIVECOLOR%;
      background-color: white;
      color: %DESTRUCTIVECOLOR%;
    }

    ^secondary-destructive:hover {
      border-color: %DESTRUCTIVEHOVERCOLOR%;
      background-color: white;
      color: %DESTRUCTIVEHOVERCOLOR%;
    }

    ^secondary-destructive:disabled {
      border-color: %DESTRUCTIVEDISABLEDCOLOR%;
      color: %DESTRUCTIVEDISABLEDCOLOR%;
    }


    /*
     * Tertiary
     */

    ^tertiary {
      border-color: #355bc4;
      background-color: %SECONDARYCOLOR%;
      color: white;
    }

    ^tertiary:hover:not(:disabled) {
      border-color: #294798;
      background-color: %SECONDARYHOVERCOLOR%;
    }

    ^tertiary:focus {
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^tertiary:disabled {
      border-color: %SECONDARYDISABLEDCOLOR%;
      background-color: %SECONDARYDISABLEDCOLOR%;
    }

    ^tertiary-destructive {
      border-color: %DESTRUCTIVECOLOR%;
      background-color: %DESTRUCTIVECOLOR%;
      color: white;
    }

    ^tertiary-destructive:hover:not(:disabled) {
      border-color: #a61414;
      background-color: %DESTRUCTIVEHOVERCOLOR%;
    }

    ^tertiary-destructive:focus {
      border-color: #a61414;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^tertiary-destructive:disabled {
      border-color: #ed8e8d;
      background-color: %DESTRUCTIVEDISABLEDCOLOR%;
    }


    /*
     * Sizes
     */

    ^small {
      font-size: 12px;
      padding: 8px 16px;
    }

    ^small:focus {
      padding: 7px 15px;
    }

    ^medium {
      font-size: 14px;
      padding: 9px 16px;
    }

    ^medium:focus {
      padding: 8px 15px;
    }

    ^large {
      font-size: 16px;
      padding: 10px 16px;
    }

    ^large:focus {
      padding: 9px 15px;
    }
  `,

  enums: [
    {
      name: 'ButtonState',
      values: [
        { name: 'NO_CONFIRM' }, // No confirmation required, fire on click
        { name: 'CONFIRM' },    // Confirmation required, debounce on click
        { name: 'DEBOUNCE' },   // Move to Armed after delay, NOP on click
        { name: 'ARMED' }       // Waiting for confirmation, fire on click
      ]
    }
  ],

  messages: [
    { name: 'confirm', message: 'Confirm' }
  ],

  properties: [
    {
      class: 'URL',
      name: 'icon',
      factory: function(action) { return this.action.icon; }
    },
    {
      class: 'String',
      name: 'iconFontFamily',
      factory: function(action) { return this.action.iconFontFamily; }
    },
    {
      class: 'String',
      name: 'iconFontClass',
      factory: function(action) { return this.action.iconFontClass; }
    },
    {
      class: 'String',
      name: 'iconFontName',
      factory: function(action) { return this.action.iconFontName; }
    },
    {
      class: 'String',
      name: 'labelPlaceholder',
      expression: function(label) { return this.action.label; }
    },
    {
      name: 'buttonState',
      factory: function() { return this.action && this.action.confirmationRequired ? this.ButtonState.CONFIRM : this.ButtonState.NO_CONFIRM; }
    },
    {
      name: 'data',
      postSet: function() {
        // Reset state
        this.buttonState = undefined;
      }
    },
    'action',
    [ 'nodeName', 'button' ],
    {
      name: 'label',
      factory: function(action) { return this.action.label; }
    },
    {
      class: 'Enum',
      of: 'foam.u2.ButtonStyle',
      name: 'buttonStyle',
      value: 'PRIMARY'
    },
    {
      class: 'Boolean',
      name: 'isDestructive',
      documentation: `
        When set to true, this action should be styled in a way that indicates
        that data is deleted in some way.
      `,
      factory: function() {
        return this.action.confirmationRequired;
      }
    },
    {
      class: 'Enum',
      of: 'foam.u2.ButtonSize',
      name: 'size',
      value: 'MEDIUM'
    },
    {
      class: 'String',
      name: 'styleClass_',
      expression: function(isDestructive, buttonStyle) {
        var s = buttonStyle.name.toLowerCase();
        return isDestructive ? s + '-destructive' : s;
      }
    }
  ],

  methods: [
    function initE() {
      this.initCls();

      this.on('click', this.click);

      this.addContent();

      this.setAttribute('title', this.action.toolTip); // hover text

      if ( this.action ) {
        this.attrs({ name: this.action.name });

        if ( this.action.isAvailable || this.action.permissionConfig != null ) {
          this.enableClass(this.myClass('unavailable'), this.action.createIsAvailable$(this.data$), true);
        }

        if ( this.action.isEnabled || this.action.permissionConfig != null ) {
          this.attrs({ disabled: this.action.createIsEnabled$(this.data$).map((e) => e ? false : 'disabled') });
        }

        this.addClass(this.myClass(this.styleClass_));
        this.addClass(this.myClass(this.size.label.toLowerCase()));
      }
    },

    function initCls() {
      this.addClass(this.myClass());
      this.addClass(this.myClass(this.action.name));
    },

    function addContent() {
      /** Add text or icon to button. **/
      if ( this.icon ) {
        // this.nodeName = 'a';
        this.start('img').attr('src', this.icon$).end();
      } else if ( this.iconFontName ) {
        this.nodeName = 'i';
        this.cssClass(this.action.name);
        this.cssClass(this.iconFontClass); // required by font package
        this.style({ 'font-family': this.iconFontFamily });
        this.add(this.iconFontName);
      }

      if ( this.label ) {
        this.add(this.label$);
      }
    }
  ],

  listeners: [
    function click(e) {
      if ( this.buttonState == this.ButtonState.NO_CONFIRM ) {
        this.action && this.action.maybeCall(this.__subContext__, this.data);
      } else if ( this.buttonState == this.ButtonState.CONFIRM ) {
        this.buttonState = this.ButtonState.DEBOUNCE;
        this.removeAllChildren();
        this.add(this.confirm);
        this.debounce();
      } else if ( this.buttonState == this.ButtonState.ARMED ) {
        this.buttonState = this.ButtonState.CONFIRM;
        this.removeAllChildren();
        this.addContent();
        this.action && this.action.maybeCall(this.__subContext__, this.data);
      }

      e.preventDefault();
      e.stopPropagation();
    },
    {
      name: 'debounce',
      isMerged: true,
      mergeDelay: 200,
      code: function() {
        if ( this.buttonState != this.ButtonState.DEBOUNCE ) return;

        this.buttonState = this.ButtonState.ARMED;
        this.deactivateConfirm();
      }
    },
    {
      name: 'deactivateConfirm',
      isMerged: true,
      mergeDelay: 6000,
      code: function() {
        if ( this.buttonState != this.ButtonState.ARMED ) return;
        this.removeAllChildren();
        this.addContent();
        this.buttonState = this.ButtonState.CONFIRM;
      }
    }
  ]
});
