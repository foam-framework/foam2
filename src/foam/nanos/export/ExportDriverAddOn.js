foam.CLASS({
  package: 'foam.nanos.export',
  name: 'ExportDriverAddOn',
  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      //typeOfConfig: String, Boolean, DAO (Enum), Number
      // 
      name: 'typeOfConfig',
      class: 'Reference',
      of: 'foam.nanos.export.ExportDriverViewConfig'
    },
    {
      name: 'labelOfProperty',
      class: 'String'
    },
    {
      name: 'doesProvideOptions',
      class: 'Boolean'
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.export.ExportDriverViewConfig',
  targetModel: 'foam.nanos.export.ExportDriverAddOn',
  forwardName: 'exportDriverAddOns',
  inverseName: 'typeOfConfig',
  cardinality: '1:*'
});