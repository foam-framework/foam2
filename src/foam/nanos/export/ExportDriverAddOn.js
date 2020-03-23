/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
      name: 'typeOfConfig',
      class: 'Reference',
      of: 'foam.nanos.export.ExportDriverDataTypeViewConfig'
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
      visibility: function(doesProvideOptions, optionsChoice) {
        return doesProvideOptions ? optionsChoice === 'DAO' ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      name: 'options',
      class: 'StringArray',
      visibility: function(doesProvideOptions, optionsChoice) {
        return doesProvideOptions ? optionsChoice === 'Array' ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.HIDDEN;
      }
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.export.ExportDriverDataTypeViewConfig',
  targetModel: 'foam.nanos.export.ExportDriverAddOn',
  forwardName: 'exportDriverAddOns',
  inverseName: 'typeOfConfig',
  cardinality: '1:*'
});