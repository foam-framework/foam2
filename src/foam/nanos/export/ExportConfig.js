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
      factory: function() {
        this.exportMetadata$find.then(v => {
          if ( v.typeOfConfig === "Boolean" )
            return false;
          else if ( v.typeOfConfig === "Integer" )
            return 0;
          else if ( v.typeOfConfig === "Float" )
            return 0.0;
          else
            return '';
        });
        
      }
    }
  ]
});