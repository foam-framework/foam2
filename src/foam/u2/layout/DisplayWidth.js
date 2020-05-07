/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.layout',
  name: 'DisplayWidth',
  documentation: `
      An enum of the responsive display width types
  `,

  values: [
      { 
        name: 'XXS',
        documentation: `
          Display for the smaller end of smartphone devices and smartphone portrait screens:
          Min-width @ 0px, max-width @ 320px and an 8 column grid
        `,
        minWidth: 0,
        cols: 8
      },
      {
        name: 'XS',
        documentation: `
          Display for the regular end of smartphone devices
          Min-width @ 320px, max-width @ 576px, and an 8 column grid
        `,
        minWidth: 320,
        cols: 8
      },
      {
        name: 'SM',
        documentation: `
          The column width for the larger end of smartphone devices and landscape smartphone screens:
          Min-width @ 576px, max-width @ 768px and a 12 column grid
        `,
        minWidth: 576,
        cols: 12
      },
      {
        name: 'MD',
        documentation: `
          The column width for most tablet screens and portrait tablet screens:
          Min-width @ 768px, max-width @ 960px and a 12 column grid
        `,
        minWidth: 768,
        cols: 12
      },
      {
        name: 'LG',
        documentation: `
          The column width for the smaller end of desktop screens:
          Min-width @ 960px, max-width @ 1280px and a 12 column grid
        `,
        minWidth: 960,
        cols: 12
      },
      {
        name: 'XL',
        documentation: `
          The column width for the majority of desktop screens:
          Min-width @ 1280px, max-width @ 1440px and a 12 column grid
        `,
        minWidth: 1280,
        cols: 12
      },
  ],

  properties: [
    {
      class: 'Int',
      name: 'cols'
    },
    {
      class: 'Int',
      name: 'minWidth'
    }
  ]
});
