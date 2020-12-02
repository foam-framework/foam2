foam.INTERFACE({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsServiceConfig',
  methods: [
    {
      name: 'getTitle',
      type: 'String'
    },
    {
      name: 'getTemplate',
      type: 'String',
    },
    {
      name: 'getServiceName',
      type: 'String',
    },
    {
      name: 'getExportClsInfo',
      type: 'Class',
      javaType: 'foam.core.ClassInfo'
    }
  ]
});