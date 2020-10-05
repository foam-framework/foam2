/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDSelect',
  extends: 'foam.u2.view.ChoiceView',

  requires: [
    'foam.u2.property.MDPopup',
  ],


  properties: [
    {
      name: 'placeholder',
      factory: function() { return '--'; }
    },
    {
      name: 'objToChoice',
      value: function(obj) {
        return [ obj.id, obj.toSummary() ];
      }
    },
    'popup'
  ],

  listeners: [
    {
      name: 'onClick',
      isFramed: true,
      code: function() {
        if ( this.mode === foam.u2.DisplayMode.RO ) return;
        if ( this.popup && ! this.popup.isHidden ) {
          this.popup.close();
          return;
        }

        if ( ! this.popup || this.popup.isHidden ) {
          var self = this;
          this.popup = this.MDPopup.create({
            data: this.data$,
            choices$: this.choices$,
            index$: this.index$
          });
          this.popup.open(this.index, this.el());
        }
      }
    }
  ],

  methods: [
    function initE() {
      if ( this.data == null && ! this.index ) {
        this.index = 0;
      }

      this.onDAOUpdate();
      var self = this;
      this.addClass(this.myClass())
      this.start('label')
        .addClass('label')
        .addClass(this.slot(function(data) {
          return typeof data !== 'undefined' &&  data !== '' ? 'label-up' : '';
        }, this.data$))
        .add(this.label$)
        .end();
      this
        .start('div').addClass('value').add(this.text$).end()
        .start('div').addClass('down-arrow').addClass('material-icons')
          .add(this.slot(function(isHidden) {
            return self.popup && ! isHidden ? 'expand_less' : 'expand_more';
          }, this.popup$.dot('isHidden')))
          .on('click', this.onClick)
        .end()

      this.dao$proxy.on.sub(this.onDAOUpdate);
    },

    function fromProperty(prop) {
      this.SUPER(prop);
      if ( ! this.dao ) {
        var dao = this.__context__[prop.targetDAOKey];
        this.dao = dao;
      }
    }
  ],

  css: `
    ^ {
      align-items: flex-end;
      border-bottom: 2px solid #000;
      display: flex;
      position: relative;
    }

    ^ .label {
      position: absolute;
      top: -8px;
      font-size: larger;
      font-weight: 500;
    }

    ^ .label-up {
      top: 0;
      font-size: smaller;
      font-weight: unset;
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