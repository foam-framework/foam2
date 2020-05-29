/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.mlang.expr',
  name: 'DateTypes',
  documentation: `
      An enum of date grouping types
  `,

  values: [
      { 
        name: 'HOURS',
        conversionFactorMs: 3600000
      },
      {
        name: 'DAYS',
        conversionFactorMs: 86400000
      },
      {
        name: 'WEEKS',
        conversionFactorMs: 604800000
      },
      {
        name: 'MONTHS',
        conversionFactorMs: 2629743833
      },
      {
        name: 'YEARS',
        conversionFactorMs: 31556926000
      }
  ],

  properties: [
    {
      class: 'Long',
      name: 'conversionFactorMs'
    },
  ]
});
