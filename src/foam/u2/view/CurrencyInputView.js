foam.CLASS({
  package: 'foam.u2.view',
  name: 'CurrencyInputView',
  extends: 'foam.u2.View',

  documentation: `
    A currency input view that formats the user's input as they type it in.
    Works similarly like a calculator or ATM machine where the values are filling
    in from the right.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'ctrl',
    'currencyDAO',
    'data as parentObj'
  ],

  expors: [
    'as data'
  ],

  css: `
    ^ {
      display: flex;
    }

    ^container-selection {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      box-sizing: border-box;
      width: 58px;
      height: 30px;

      border: 1px solid /*%GREY3%*/ #cbcfd4;
      border-right: none;
      border-radius: 3px 0 0 3px;
    }

    ^container-selection p {
      margin: 0;
    }

    ^container-input {
      box-sizing: border-box;
      flex: 1;
      height: 30px;

      font-size: 14px;

      border: 1px solid /*%GREY3%*/ #cbcfd4;
      border-left: none;
      border-radius: 0 3px 3px 0;
    }
  `,

  properties: [
    {
      name: 'contingentProperty'
    },
    {
      class: 'Reference',
      of: 'foam.core.Unit',
      name: 'currencyId'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'currency'
    },
    {
      class: 'String',
      name: 'valueString',
      factory: function() {
        return this.data || 0;
      },
      preSet: function(_, n) {
        var sanitized = this.sanitizeString(n)
        this.data = sanitized;
        return this.currency ? this.currency.format(sanitized, true) : sanitized;
      },
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      }
    },
    {
      class: 'Long',
      name: 'data',
      documentation: 'Value stored is unformatted'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.contingentProperty && this.parentObj ) {
        this.currencyId$ = this.parentObj$.dot(this.contingentProperty);
      }
      this.onDetach(this.currencyId$.sub(this.currencyIdUpdate));
      this.currencyIdUpdate();
    },

    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass())
        .add(this.slot(function(mode, currency) {
          if ( mode === foam.u2.DisplayMode.RW ) {
            return this.E().style({ 'display': 'flex' }).start().addClass(self.myClass('container-selection'))
              .start('p').addClass(self.myClass('label-currency'))
                .add(currency ? `${currency.id} ${currency.symbol}` : '--')
              .end()
            .end()
            .startContext({ data: self })
              .start(self.VALUE_STRING).addClass(self.myClass('container-input'))
              .end()
            .endContext();
          }
          return self.E().start('p').addClass(self.myClass('label-currency'))
            .add(currency ? currency.format(self.data) : self.data)
            .end();
        }))

    },

    function sanitizeString(s) {
      return s.replace(/[\D\s\._\-]+/g, "");
    }
  ],

  listeners: [
    {
      name: 'currencyIdUpdate',
      code: function() {
        if ( ! this.currencyId ) {
          this.currency = null;
          return;
        }
        this.currencyDAO.find(this.currencyId).then((currency) => {
          this.currency = currency;
          this.valueString = currency.format(this.sanitizeString(this.valueString), true);
        });
      }
    }
  ]
})
