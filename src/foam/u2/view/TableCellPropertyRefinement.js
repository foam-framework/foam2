foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableRefinesNode',
  refines: 'foam.core.Property',
  flags: ['node'],
  properties: [
    {
      name: 'tableHeaderFormatter',
    },
    {
      name: 'tableCellFormatter',
    },
    {
      name: 'tableWidth'
    }
  ]
});
