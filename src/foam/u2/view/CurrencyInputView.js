foam.CLASS({
  package: 'foam.u2.view',
  name: 'CurrencyInputView',
  extends: 'foam.u2.Controller',

  documentation: '',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currencyDAO',
    'data as parentObj'
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
      value: '0',
      preSet: function(_, n) {
        return this.currency.format(this.sanitizeString(n), true);
      },
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      }
    },
    {
      class: 'Long',
      name: 'value',
      documentation: 'Value stored is unformatted',
      expression: function(valueString) {
        console.log(this.sanitizeString(valueString));
        return this.sanitizeString(valueString);
      }
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
      var self = this;
      this.addClass(this.myClass())
        .start().addClass(this.myClass('container-selection'))
          .start('p').addClass(this.myClass('label-currency'))
            .add(this.slot(function(currency) {
              return currency ? `${currency.id} ${currency.symbol}` : '--';
            }))
          .end()
        .end()
        .start(this.VALUE_STRING).addClass(this.myClass('container-input'))
        .end();
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
