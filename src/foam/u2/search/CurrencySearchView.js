/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'CurrencySearchView',
  extends: 'foam.u2.search.FloatSearchView',

  documentation: `
    A SearchView for properties of type Currency. Lets the
    user filter by two criteria:
      1. A qualifier (Eg: equal to, not equal to, greater than)
      2. An amount (Eg: 25.19)
  `,

  properties: [
    {
      name: 'predicate',
      documentation: `All SearchViews must have a predicate as required by the
          SearchManager. The SearchManager will read this predicate and use it
          to filter the dao being displayed in the view.`,
      expression: function(qualifier, amount) {
        amount = typeof amount === 'number' ? Math.floor(amount * 100) : 0;
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
      value: 'currency search view'
    }
  ]
});
