foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsPropertyMetadata',
  properties: [
    {
      name: 'columnName',
      class: 'String'
    },
    {
      name: 'columnWidth',
      class: 'Int'//0 if no width found
    },
    {
      name: 'cellType',
      class: 'String'
    },
    {
      name: 'pattern',
      class: 'String'
    }
  ]
});