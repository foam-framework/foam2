foam.CLASS({
  package: 'foam.nanos.export',
  name: 'ExportConfig',
  properties: [
    {
      name: 'configValue',
      class: 'String'
    },
    {
      name: 'exportMetadata',
      class: 'Reference',
      of: 'foam.nanos.export.ExportDriverAddOn'
    }
  ]
});