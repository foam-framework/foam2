/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'FloatSearchView',
  extends: 'foam.u2.search.IntegerSearchView',

  documentation: `
    A SearchView for properties of type Float and Double. Lets the
    user filter by two criteria:
      1. A qualifier (Eg: equal to, not equal to, greater than)
      2. An amount (Eg: 25.19)
  `,

  properties: [
    {
      class: 'Float',
      name: 'amount',
      documentation: `The number to filter by.`,
      view: {
        class: 'foam.u2.FloatView',
        onKey: true,
        precision: 2
      }
    },
    {
      name: 'name',
      documentation: `Required by SearchManager.`,
      value: 'float search view'
    }
  ]
});
