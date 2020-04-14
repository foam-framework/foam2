/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.extraconfig',
  name: 'Config',
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
            this.configValue = false;
          else if ( this.exportMetadata.typeOfConfig === 'Integer' )
            this.configValue = 0;
          else if ( this.exportMetadata.typeOfConfig === 'Float' )
            this.configValue = 0;
          else if ( this.exportMetadata.doesProvideOptions && this.exportMetadata.optionsChoice === 'Array' )
            this.configValue = this.exportMetadata.options[0];
          else if ( this.exportMetadata.doesProvideOptions && this.exportMetadata.optionsChoice === 'DAO' ) {
            var dao = this.__context__[v.daoSource];
            dao.select().then((o) => {
              this.configValue = o.array[0].id;
            });
          }
          else
            return '';       
        return;
      }
    }
  ]
});