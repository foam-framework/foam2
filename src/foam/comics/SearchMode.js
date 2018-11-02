/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.comics',
  name: 'SearchMode',

  documentation: `
    Decides which kind of search controls will be used in the DAO controller.
  `,

  values: [
    {
      name: 'FULL',
      label: 'Full',
      documentation: 'Full search capabilities.'
    },
    {
      name: 'NONE',
      label: 'None',
      documentation: 'No search controls.'
    },
    {
      name: 'SIMPLE',
      label: 'Simple',
      documentation: 'A single search field that does a keyword search.'
    }
  ]
});
