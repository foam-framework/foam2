/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDSelect',
  extends: 'foam.u2.property.MDAbstractChoiceView',

  requires: [
    'foam.u2.property.MDPopup',
  ],
  imports: [
    'document',
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'inline',
      defaultValue: false,
      attribute: true,
    },
    {
      type: 'Boolean',
      name: 'showLabel',
      attribute: true,
      defaultValueFn: function() {
        return !this.inline;
      }
    }
  ],

  listeners: [
    {
      name: 'onClick',
      isFramed: true,
      code: function() {
        if ( this.mode === foam.u2.DisplayMode.RO ) return;
        var active = this.document.activeElement;
        if (active) active.blur();

        var self = this;
        var popup = this.MDPopup.create({
          data$: this.data$,
          choices$: this.choices$,
          autoSetData: this.autoSetData
        });
        popup.open(this.index, this.el());
      }
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
      var label = this.prop ? this.prop.label : this.label;
      if ( label ) {
        this.start('label')
          .addClass('label')
          .addClass(this.slot(function(data) {
            return (typeof data == 'undefined' || data == '' || data < 0) ? 'label-offset' : '';
          }, this.data$))
          .add(label)
          .end();
      }
      this.start('div').addClass('value').add(this.text$).end()
      .start('div').addClass('down-arrow').addClass('material-icons')
        .add('expand_more').on('click', this.onClick)
      .end()
    }
  ],

  css: `
  ^ {
      align-items: flex-end;
      border-bottom: 3px solid #e0e0e0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      position: relative;
    }
    ^ .show-label {
      margin-top: 24px;
    }
    ^ .label {
      flex-grow: 1;
      position: absolute;
      top: -8px;
    }
    ^ .show-label .label {
      display: block;
    }
    ^ .value {
      flex-grow: 1;
      padding-top: 2rem;
    }
    ^ .down-arrow {
      font-weight: 800;
      font-size: 3rem;
    }
  `
});