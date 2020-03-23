/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'ExportConfig',
  properties: [
    {
      name: 'configValueString',
      class: 'String',
      value: '',
      expression: function(configValue) {
        return configValue.toString();
      }
    },
    {
      name: 'exportMetadata',
      class: 'Reference',
      of: 'foam.nanos.export.ExportDriverAddOn'
    },
    {
      name: 'configValue',
      factory: function(exportMetadata$find) {
        this.exportMetadata$find.then(v => {
          if ( v.typeOfConfig === 'Boolean' )
            this.configValue = false;
          else if ( v.typeOfConfig === 'Integer' )
            this.configValue = 0;
          else if ( v.typeOfConfig === 'Float' )
            this.configValue = 0;
          else
            this.configValue = '';
        });
        return;
      }
    }
  ]
});