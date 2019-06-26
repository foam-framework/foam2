foam.ENUM({
  package: 'foam.u2.layout',
  name: 'DisplayWidth',
  documentation: `
      An enum of the responsive display width types
  `,

  values: [
      { name: 'XXS', minWidth: 0, cols: 8 },
      { name: 'XS', minWidth: 320, cols: 8 },
      { name: 'SM', minWidth: 576, cols: 12 },
      { name: 'MD', minWidth: 768, cols: 12 },
      { name: 'LG', minWidth: 960, cols: 12 },
      { name: 'XL', minWidth: 1280, cols: 12 },
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
