foam.ENUM({
  package: 'foam.u2.layout',
  name: 'DisplayWidth',
  documentation: `
      An enum of the responsive display width types
  `,

  values: [
      { name: 'XXS', label: 320, cols: 8 },
      { name: 'XS', label: 576, cols: 8 },
      { name: 'SM', label: 768, cols: 12 },
      { name: 'MD', label: 960, cols: 12 },
      { name: 'LG', label: 1280, cols: 12 },
      { name: 'XL', label: 1440, cols: 12 },
  ],

  properties: [
    {
      class: 'Int',
      name: 'cols'
    }
  ]
});
