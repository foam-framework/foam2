foam.CLASS({
  package: 'foam.nanos.export.report',
  name: 'Template',
  properties: [
    {
      name: 'id',
      class: 'String',
      documetation: 'file id',
    },
    {
      name: 'daoKey',
      class: 'String'
    },
    {
      name: 'name',
      class: 'String',
    },
    {
      class: 'StringArray',
      name: 'columnNames',
      documentation: 'List of property names which required for template'
    }
  ]
});