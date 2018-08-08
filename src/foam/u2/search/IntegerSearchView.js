/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'IntegerSearchView',
  extends: 'foam.u2.Controller',

  documentation: `
    A SearchView for properties of type Int, Short, Long, and Byte. Lets the
    user filter by two criteria:
      1. A qualifier (Eg: equal to, not equal to, greater than)
      2. An amount (Eg: 25)
  `,

  requires: [
    'foam.mlang.predicate.True',
  ],

  properties: [
    {
      name: 'property',
      documentation: `The property that this view is filtering by. Should be of
          type Int, Short, Long, or Byte.`,
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
      documentation: `The number to filter by.`,
      view: {
        class: 'foam.u2.FloatView',
        onKey: true,
        step: 1
      }
    },
    {
      name: 'predicate',
      documentation: `All SearchViews must have a predicate as required by the
          SearchManager. The SearchManager will read this predicate and use it
          to filter the dao being displayed in the view.`,
      expression: function(qualifier, amount) {
        if ( qualifier ) {
          return foam.mlang.predicate[qualifier].create({
            arg1: this.property,
            arg2: amount
          });
        }
        return this.True.create();
      }
    },
    {
      name: 'name',
      documentation: `Required by SearchManager.`,
      value: 'integer search view'
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
