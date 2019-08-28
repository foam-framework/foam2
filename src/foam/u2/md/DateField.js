/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'DateField',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.EasyDialog',
    'foam.u2.md.DatePicker'
  ],

  properties: [
    ['nodeName', 'div'],
    {
      name: 'data',
      postSet: function(old, nu) {
        this.realData = nu;
      }
    },
    {
      type: 'Date',
      name: 'realData',
      factory: function() {
        return new Date();
      }
    },
    {
      name: 'showLabel',
      attribute: true,
      factory: function() {
        return ! this.inline;
      }
    },
    {
      type: 'Boolean',
      name: 'inline',
      attribute: true
    },
    {
      name: 'label',
      attribute: true
    },
    {
      name: 'placeholder',
      attribute: true,
      documentation: 'Ignored when $$DOC{ref:".showLabel"} is true, but used ' +
          'as an inline placeholder when it\'s false.',
      factory: function() { return this.label; }
    },
    {
      type: 'Function',
      name: 'dateFormatter',
      value: function(date) { return date.toLocaleDateString(); }
    },
    'dialog_',
    'datePicker_'
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      if ( this.showLabel ) {
        this.start('label')
          .addClass(this.myClass('label'))
          .addClass(this.slot(function(data, focused) {
            return (typeof data !== 'undefined' && data !== '') ||
                focused ? self.myClass('label-offset') : '';
          }, this.realData$, this.focused$))
          .add(this.label$)
        .end();
      } else {
        this.addClass(this.myClass('no-label'));
      }

      this.inputE();

      if ( this.showValidation ) {
        this.enableCls(this.myClass('invalid'), this.validationError_$);
        this.start().addClass(this.myClass('validation-error')).add(this.validationError_$).end();
      }
    },

    function inputE() {
      var self = this;
      var input = this.start('span')
        .addClass(this.myClass('inner'))
        .on('click', this.onDateClick);

      input.add(this.slot(function(data, placeholder, showLabel) {
        return data ? this.dateFormatter(data) :
            (placeholder && !showLabel ?
                placeholder : this.Entity.create({ name: 'nbsp' }));
      }.bind(this), this.realData$, this.placeholder$, this.showLabel$));

      input.end();
    },

    function fromProperty(prop) {
      this.label = this.label || prop.label;
      return this.SUPER(prop);
    }
  ],

  listeners: [
    function onDateClick() {
      // Make sure to blur the active element, whatever it is.
      // Hides the keyboard on mobile.
      var active = this.document.activeElement;
      if ( active ) active.blur();
      this.datePicker_ = this.DatePicker.create({ data$: this.realData$ });
      this.dialog_ = this.EasyDialog.create({
        title: this.datePicker_.titleE,
        body: this.datePicker_.bodyE,
        padding: false,
        onConfirm: function() {
          this.data        = this.datePicker_.softData;
          this.datePicker_ = null;
          this.dialog_     = null;
        }.bind(this)
      });
      this.dialog_.open();
    },
  ],

  css: `
    ^ {
      align-items: stretch;
      display: flex;
      flex-direction: column;
      margin: 8px;
      padding: 32px 8px 8px 8px;
      position: relative;
    }
    ^label {
      color: #999;
      flex-grow: 1;
      font-size: 14px;
      font-weight: 500;
      position: absolute;
      top: 32px;
      transition: font-size 0.5s, top 0.5s;
      z-index: 0;
    }
    ^label-offset {
      font-size: 85%;
      top: 8px;
    }
    ^no-label {
      padding-top: 8px;
    }
    ^inner {
      background: transparent;
      border-bottom: 1px solid #e0e0e0;
      border-left: none;
      border-top: none;
      border-right: none;
      color: #444;
      flex-grow: 1;
      font-family: inherit;
      font-size: inherit;
      margin-bottom: -8px;
      padding: 0 0 7px 0;
      resize: none;
      z-index: 1;
    }

    ^invalid ^inner {
      border-bottom: 2px solid #db4437;
      margin-bottom: 4px;
    }
    ^validation-error {
      color: #db4437;
    }
  `
});
