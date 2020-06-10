/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.extraconfig',
  name: 'ExtraConfigValue',
  documentation: `Config class is used for storing value (configValueString) for a certain configuration (exportMetadata).
    configValue is used for setting configValueString value from UI with toString method`,
  properties: [
    {
      name: 'configValueString',
      class: 'String',
      value: ''
    },
    {
      name: 'exportMetadata',
      class: 'FObjectProperty',
      of: 'foam.nanos.extraconfig.AddOn'
    },
    {
      name: 'configValue',
      factory: function() {     
          if ( this.exportMetadata.typeOfConfig === 'Boolean' )
            return false;
          if ( this.exportMetadata.typeOfConfig === 'Integer' || this.exportMetadata.typeOfConfig === 'Float' )
            return 0;
          if ( this.exportMetadata.doesProvideOptions && this.exportMetadata.optionsChoice === 'Array' )
            return this.exportMetadata.options[0];
          if ( this.exportMetadata.doesProvideOptions && this.exportMetadata.optionsChoice === 'DAO' ) {
            var dao = this.__context__[this.exportMetadata.daoSource];
            dao.select().then((o) => {
              return this.configValue = o.array[0].id;
            });
          }
          return '';
      }
    }
  ]
});