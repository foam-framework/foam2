/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.extraconfig',
  name: 'AddOn',
  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'configForClass',
      class: 'StringArray'
    },
    {
      //typeOfConfig: String, Boolean, DAO (Enum), Number
      name: 'typeOfConfig',
      class: 'Reference',
      of: 'foam.nanos.extraconfig.DataTypeViewConfig'
    },
    {
      name: 'labelForConfig',
      class: 'String'
    },
    {
      name: 'doesProvideOptions',
      class: 'Boolean',
      expression: function(typeOfConfig) {
        return typeOfConfig === 'DAO';
      }
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
  sourceModel:  'foam.nanos.extraconfig.DataTypeViewConfig',
  targetModel:  'foam.nanos.extraconfig.AddOn',
  forwardName:  'extraConfigAddOns',
  inverseName:  'typeOfConfig',
  sourceDAOKey: 'extraConfigDataTypeViewConfigDAO',
  targetDAOKey: 'extraConfigAddOnDAO',
  cardinality:  '1:*'
});