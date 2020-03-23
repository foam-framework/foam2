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
      value: ''
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
          if ( v.typeOfConfig === 'Boolean' )
            this.configValue = false;
          else if ( v.typeOfConfig === 'Integer' )
            this.configValue = 0;
          else if ( v.typeOfConfig === 'Float' )
            this.configValue = 0;
          else if ( v.doesProvideOptions && v.optionsChoice === 'Array' )
            this.configValue = v.options[0];
          else if ( v.doesProvideOptions && v.optionsChoice === 'DAO' ) {
            var dao = this.__context__[v.daoSource];
            dao.select().then((o) => {
              this.configValue = o.array[0].id;
            });
          }
          else
            this.configValue = '';
        });
        return;
      }
    }
  ]
});