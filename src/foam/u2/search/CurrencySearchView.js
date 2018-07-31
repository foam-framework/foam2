/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'CurrencySearchView',
  extends: 'foam.u2.View',

  documentation: `
    A SearchView for properties of type Currency. Lets the user filter by two
    criteria:
      1. A qualifier (Eg: equal to, not equal to, greater than)
      2. An amount (Eg: 25.38)
  `,

  exports: [
    'as data'
  ],

  requires: [
    'foam.mlang.predicate.True',
  ],

  properties: [
    {
      name: 'property',
      documentation: `The property that this view is filtering by. Should be of
          type Currency.`,
      required: true
    },
    {
      class: 'String',
      name: 'qualifier',
      documentation: `Lets the user choose an MLang predicate to filter by.`,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['True', '--'],
          ['Eq', 'is equal to'],
          ['Neq', 'is not equal to'],
          ['Gt', 'is greater than'],
          ['Lt', 'is less than'],
          ['Gte', 'is greater than or equal to'],
          ['Lte', 'is less than or equal to'],
        ],
        defaultValue: 'True'
      }
    },
    {
      class: 'Float',
      name: 'amount',
      documentation: `The amount of money to filter by.`,
      view: {
        class: 'foam.u2.FloatView',
        onKey: true,
        precision: 2
      }
    },
    {
      name: 'predicate',
      documentation: `All SearchViews must have a predicate as required by the
          SearchManager. The SearchManager will read this predicate and use it
          to filter the dao being displayed in the view.`,
      expression: function(qualifier, amount) {
        amount = typeof amount === 'number' ?
            Math.floor(amount * 100) :
            0;
        if ( qualifier ) {
          var rtn = foam.mlang.predicate[qualifier].create({
            arg1: this.property,
            arg2: amount
          });
          console.log(rtn.toString());
          return rtn;
        }
        var rtn = this.True.create();
        console.log(rtn.toString());
        return rtn;
      }
    },
    {
      name: 'name',
      documentation: `Required by SearchManager.`,
      value: 'currency search view'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start(this.QUALIFIER)
          .start('div').addClass(this.myClass('carrot')).end()
        .end()
        .add(this.AMOUNT);
    },

    /**
     * Clears the fields to their default values.
     * Required on all SearchViews. Called by ReciprocalSearch.
     */
    function clear() {
      this.qualifier = 'True';
      this.value = 0;
    }
  ],

  css: `
    ^ {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    ^ > * + * {
      margin-left: 13px;
    }

    ^ .property-qualifier {
      position: relative;
    }

    ^carrot {
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid black;
      position: absolute;
      right: 8px;
      top: 18px;
      z-index: 1;
    }

    ^ .foam-u2-tag-Select {
      background-color: white;
      border-radius: 2px;
      border: 1px solid #dce0e7;
      color: #093649;
      height: 40px;
      padding: 0 20px 0 8px;
      -webkit-appearance: none; /* Fix rounded corners in Chrome on OS X */
    }

    ^ .foam-u2-FloatView {
      border-radius: 2px;
      border: 1px solid #dce0e7;
      color: #093649;
      font-size: 14px;
      height: 40px;
      padding: 0 14px 0 21px;
      width: 92px;
    }
  `
});
