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
      font-family: 'Lato', sans-serif;
      border-radius: 4px;
      text-align: center;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      outline: none;
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
      border-color: /*%SECONDARY1%*/ #4a33f4;
      background-color: /*%PRIMARY3%*/ #406dea;
      color: white;
    }

    ^primary:hover:not(:disabled) {
      border-color: /*%PRIMARY1%*/ #202341;
      border: 1px solid #294798;
      background-color: /*%PRIMARY2%*/ #144794;
    }

    ^primary:focus:not(:hover) {
      border-color: #23186c;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary:disabled {
      border: 1px solid /*%PRIMARY4%*/ #a7beff;
      background-color: /*%PRIMARY4%*/ #a7beff;
    }

    /*
     * Primary destructive
     */

    ^primary-destructive {
      background-color: /*%DESTRUCTIVE3%*/ #d9170e;
      border: 1px solid /*%DESTRUCTIVE3%*/ #d9170e;
      color: white;
    }

    ^primary-destructive:hover:not(:disabled) {
      border-color: /*%DESTRUCTIVE1%*/ #a61414;
      background-color: /*%DESTRUCTIVE2%*/ #a61414;
    }

    ^primary-destructive:focus {
      border: 2px solid #a61414;
      padding: 7px 15px;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary-destructive:disabled {
      border-color: /*%DESTRUCTIVE4%*/ #ed8e8d;
      background-color: /*%DESTRUCTIVE5%*/ #fbedec;
    }


    /*
     * Secondary
     */

    ^secondary {
      border: 1px solid /*%PRIMARY3%*/ #406dea;
      background-color: white;
      color: /*%PRIMARY3%*/ #406dea;
    }

    ^secondary:hover {
      border-color: /*%PRIMARY2%*/ #144794;
      background-color: white;
      color: /*%PRIMARY2%*/ #144794;
    }

    ^secondary:focus:not(:hover) {
      border-color: /*%SECONDARY2%*/ #432de7;
      color: /*%PRIMARY2%*/ #144794;
    }

    ^secondary:disabled {
      border-color: /*%PRIMARY4%*/ #a7beff;
      color: /*%PRIMARY4%*/ #a7beff;
    }


    /*
     * Secondary destructive
     */

    ^secondary-destructive {
      border-color: /*%DESTRUCTIVE3%*/ #d9170e;
      background-color: white;
      color: /*%DESTRUCTIVE3%*/ #d9170e;
    }

    ^secondary-destructive:hover {
      border-color: /*%DESTRUCTIVE2%*/ #a61414;
      background-color: white;
      color: /*%DESTRUCTIVE2%*/ #a61414;
    }

    ^secondary-destructive:disabled {
      border-color: /*%DESTRUCTIVE5%*/ #fbedec;
      color: /*%DESTRUCTIVE5%*/ #fbedec;
    }


    /*
     * Tertiary
     */

    ^tertiary {
      background: none;
      border: 1px solid transparent;
      box-shadow: none;
      color: #8e9090;
    }

    ^tertiary:hover:not(:disabled) {
      color: /*%PRIMARY3%*/ #406dea;
    }

    ^tertiary:focus:not(:hover) {
      border-color: /*%SECONDARY1%*/ #4a33f4;
    }

    ^tertiary:disabled {
      color: /*%GREY3%*/ #cbcfd4;
    }


    /*
     * Tertiary destructive
     */

    ^tertiary-destructive {
      border-color: transparent;
      background-color: transparent;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^tertiary-destructive:hover:not(:disabled) {
      border-color: transparent;
      background-color: transparent;
    }

    ^tertiary-destructive:focus:not(:hover) {
      border-bottom-color: /*%PRIMARY3%*/ #406dea;

    }

    ^tertiary-destructive:disabled {
      color: /*%GREY3%*/ #cbcfd4;
    }


    /*
     * Sizes
     */

    ^small {
      font-size: 10px;
      padding: 8px 16px;
    }

    ^medium {
      font-size: 14px;
      padding: 9px 16px;
    }

    ^large {
      font-size: 16px;
      padding: 13px 16px;
    }

    ^tertiary^small,
    ^tertiary^medium,
    ^tertiary^large {
      padding-left: 0;
      padding-right: 0;
    }

    ^tertiary^small:focus,
    ^tertiary^medium:focus,
    ^tertiary^large:focus {
      padding-left: 1px;
      padding-right: 1px;
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
    { name: 'CONFIRM', message: 'Confirm' }
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
      this.tooltip = this.action.toolTip;

      this.SUPER();

      this.initCls();

      this.on('click', this.click);

      this.addContent();

      if ( this.action ) {
        this.attrs({ name: this.action.name });

        this.enableClass(this.myClass('unavailable'), this.action.createIsAvailable$(this.__context__, this.data), true);
        this.attrs({ disabled: this.action.createIsEnabled$(this.__context__, this.data).map((e) => e ? false : 'disabled') });

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
      try {
        if ( this.buttonState == this.ButtonState.NO_CONFIRM ) {
          this.action && this.action.maybeCall(this.__subContext__, this.data);
        } else if ( this.buttonState == this.ButtonState.CONFIRM ) {
          this.buttonState = this.ButtonState.DEBOUNCE;
          this.removeAllChildren();
          this.add(this.CONFIRM);
          this.debounce();
        } else if ( this.buttonState == this.ButtonState.ARMED ) {
          this.buttonState = this.ButtonState.CONFIRM;
          this.removeAllChildren();
          this.addContent();
          this.action && this.action.maybeCall(this.__subContext__, this.data);
        }
      } catch (x) {}

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
