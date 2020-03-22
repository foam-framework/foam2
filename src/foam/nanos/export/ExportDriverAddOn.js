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
    },
    {
      name: 'optionsChoice',
      class: 'String',
      visibility: function(doesProvideOptions) {
        return doesProvideOptions ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'DAO', 'Array' ] },
      value: 'DAO'
    },
    {
      name: 'daoSource',
      class: 'String',
      visibility: function(optionsChoice) {
        return optionsChoice === 'DAO' ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      name: 'options',
      class: 'StringArray',
      visibility: function(optionsChoice) {
        return optionsChoice === 'Array' ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
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